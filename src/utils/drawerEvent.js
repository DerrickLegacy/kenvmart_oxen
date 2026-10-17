// src/utils/drawerEvent.js
export const toggleMobileFilterDrawer = () => {
    window.dispatchEvent(new Event('toggle-filter-drawer'));
};