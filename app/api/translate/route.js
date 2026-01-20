import { translate } from '@vitalets/google-translate-api';

export async function POST(request) {
  try {
    const { text, targetLang } = await request.json();

    if (!text || !targetLang) {
      return Response.json(
        { error: 'Missing text or targetLang parameter' },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return Response.json({ translatedText: text });
    }

    const result = await translate(text, { to: targetLang });

    return Response.json({
      translatedText: result.text,
      detectedLanguage: result.raw?.src || 'unknown'
    });
  } catch (error) {
    console.error('Translation error:', error);
    return Response.json(
      { error: 'Translation failed', details: error.message },
      { status: 500 }
    );
  }
}
