import fetch from 'node-fetch';

export const extractContent = async ({ file_base64, file_type, filename }) => {
  try {
    const url = `${process.env.PYTHON_SERVICE_URL}/extract`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_base64, file_type, filename })
    });

    if (!response.ok) {
      throw new Error('Python extraction service returned an error');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Extraction Service Error:', error.message);
    throw error;
  }
};
