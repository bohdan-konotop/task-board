export const getBoardsFromStorage = () => {
  return JSON.parse(localStorage.getItem('boards') || '[]');
};
