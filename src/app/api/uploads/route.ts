import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient, saveDocument, updateDocumentText, updateDocumentError, getDocuments, deleteDocument } from '@/lib/supabase';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENTS = 10;

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No estás autenticado' },
        { status: 401 }
      );
    }

    // Check document limit
    const existingDocs = await getDocuments(user.id);
    if (existingDocs.length >= MAX_DOCUMENTS) {
      return NextResponse.json(
        { success: false, error: `Ya tienes el máximo de ${MAX_DOCUMENTS} documentos. Elimina uno para subir otro.` },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se recibió ningún archivo' },
        { status: 400 }
      );
    }

    // Validate type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'El archivo debe ser un PDF' },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'El archivo no puede pesar más de 10MB' },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const adminClient = createAdminClient();
    const storagePath = `${user.id}/${crypto.randomUUID()}.pdf`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await adminClient.storage
      .from('company-documents')
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: 'Error al subir el archivo. Intenta de nuevo.' },
        { status: 500 }
      );
    }

    // Save document metadata
    const doc = await saveDocument(user.id, file.name, file.size, storagePath);

    // Extract text from PDF — if extraction fails, still mark as ready (file uploaded fine)
    let extractedText = '';
    let charCount = 0;
    try {
      // Import the lib directly to avoid pdf-parse's index.js test file bug
      // (index.js tries to read ./test/data/05-versions-space.pdf when module.parent is null)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse/lib/pdf-parse.js');
      const result = await pdfParse(buffer);
      extractedText = result.text || '';
      charCount = extractedText.length;
    } catch (pdfError) {
      const errMsg = pdfError instanceof Error ? pdfError.message : String(pdfError);
      console.error('PDF text extraction failed (non-fatal):', errMsg);
      // Non-fatal: file was uploaded successfully, just couldn't extract text
      // This can happen with scanned PDFs, image-only PDFs, or serverless env issues
    }

    // Always mark as ready — the file is in storage regardless of text extraction
    await updateDocumentText(doc.id, extractedText, charCount);

    return NextResponse.json({
      success: true,
      data: { ...doc, status: 'ready', extracted_text: extractedText, char_count: charCount },
    });
  } catch (error) {
    console.error('Error en POST /api/uploads:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar el archivo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No estás autenticado' },
        { status: 401 }
      );
    }

    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'Falta el ID del documento' },
        { status: 400 }
      );
    }

    await deleteDocument(user.id, documentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/uploads:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el documento' },
      { status: 500 }
    );
  }
}
