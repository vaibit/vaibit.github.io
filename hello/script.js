<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", () => {
    const featureItems = document.querySelectorAll(".feature-item");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target); // Stop observing once the animation triggers
            }
        });
    }, {
        threshold: 0.2
    });

    featureItems.forEach((item) => {
        observer.observe(item);
    });
});
=======
document.addEventListener("DOMContentLoaded", () => {
    const featureItems = document.querySelectorAll(".feature-item");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target); // Stop observing once the animation triggers
            }
        });
    }, {
        threshold: 0.2
    });

    featureItems.forEach((item) => {
        observer.observe(item);
    });
});
>>>>>>> 9395894faddde7fd642ffc8d7380301834ea089b
