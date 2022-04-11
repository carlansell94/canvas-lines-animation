(() => {
    window.addEventListener('load', () => {
        const canvas = document.querySelector('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const os = canvas.transferControlToOffscreen();

        const worker = new Worker("animation-os.js");
        worker.postMessage({canvas: os}, [os]);

        function debounce(func, timeout = 250) {
            let timer;

            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => { func.apply(this, args); }, timeout);
            };
        }

        function pageScrollHandler() {
            if (window.scrollY > canvas.height) {
                worker.postMessage({running: false});
                canvas.style.display = 'none';
                return;
            }

            canvas.style.display = 'block';
            worker.postMessage({running: true});
        }

        window.addEventListener('resize', () => {
            os.width = window.innerWidth;
            os.height = window.innerHeight;

            worker.postMessage({width: os.width, height: os.height})
        });

        window.addEventListener('scroll', debounce(() => pageScrollHandler()));
    });
})();

