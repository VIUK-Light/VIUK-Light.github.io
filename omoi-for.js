(() => {
  const categoryName = document.querySelector('[data-category-name]');
  const categoryHeading = document.querySelector('[data-category-heading]');
  if (!categoryName || !categoryHeading) return;

  const categories = [
    { name: 'Adults', color: 'adults' },
    { name: 'Couples', color: 'couples' },
    { name: 'Family', color: 'family' },
    { name: 'Friends', color: 'friends' },
    { name: 'Self-Care', color: 'self-care' },
  ];
  const interval = 1000;
  let activeIndex = 0;
  let timer;

  const clearTimer = () => {
    window.clearTimeout(timer);
    timer = undefined;
  };

  const scheduleNext = () => {
    clearTimer();
    if (document.hidden) return;

    timer = window.setTimeout(() => {
      activeIndex = (activeIndex + 1) % categories.length;
      categoryName.textContent = categories[activeIndex].name;
      categoryName.dataset.category = categories[activeIndex].color;
      categoryHeading.dataset.category = categories[activeIndex].color;
      scheduleNext();
    }, interval);
  };

  scheduleNext();
  document.addEventListener('visibilitychange', scheduleNext);
})();
