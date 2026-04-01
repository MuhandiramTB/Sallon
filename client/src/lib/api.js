class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function api(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  let res;
  try {
    res = await fetch(`/api/v1${endpoint}`, config);
  } catch (err) {
    throw new ApiError('Server is not responding. Please try again.', 0);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Something went wrong' }));
    throw new ApiError(err.error || 'Request failed', res.status, err.details);
  }

  return res.json();
}

export { ApiError };
