export const getExpenses = async () => {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error(`GET failed: ${response.status}`);
    }
    const data = await response.json();
    // Sort by createdAt descending
    return data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};