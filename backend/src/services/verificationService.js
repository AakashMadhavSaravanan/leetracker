import fetch from 'node-fetch';

export const verifySubmission = async ({ code, screenshot_base64, token, username, problem_title }) => {
  try {
    const url = `${process.env.PYTHON_SERVICE_URL}/verify`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, screenshot_base64, token, username, problem_title })
    });

    if (!response.ok) {
      throw new Error('Python verification service returned an error');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Verification Service Error:', error.message);
    throw error;
  }
};
