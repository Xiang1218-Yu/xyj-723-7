// This function checks if the current hostname is one of the localhost hostnames or IP addresses
const isLocalhost = ['localhost', '[::1]', /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/].some(
  (hostname) => window.location.hostname === hostname || window.location.hostname.match(hostname)
);

/**
 * This function registers a service worker for the application in production mode.
 * If the app is not running in production mode, or if the browser doesn't support service workers, nothing happens.
 * If the app is running in production mode, but the public URL doesn't match the origin, nothing happens.
 * If the app is running in production mode and the public URL matches the origin, the service worker is registered.
 * If the app is running on localhost, the service worker is checked to make sure it is valid.
 * If the service worker is not valid, it is unregistered and the page is reloaded.
 * @param {Object} config - A configuration object with optional callbacks for service worker registration success or update.
 */
export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Public URL doesn't match the origin, so don't register the service worker
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Check if the service worker is valid
        checkValidServiceWorker(swUrl, config);
        // Display a message to indicate that the app is being served cache-first by the service worker
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://bit.ly/CRA-PWA'
          );
        });
      } else {
        // Register the service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

/**
 * This function registers a valid service worker for the application.
 * If the service worker is updated, a message is logged indicating that new content is available.
 * If the service worker is not updated, a message is logged indicating that the content is cached for offline use.
 * If an onUpdate callback function is provided in the config object, it is called with the service worker registration as an argument.
 * If an onSuccess callback function is provided in the config object, it is called with the service worker registration as an argument.
 * @param {string} swUrl - The URL of the service worker file.
 * @param {Object} config - A configuration object with optional callbacks for service worker registration success or update.
 */
async function registerValidSW(swUrl, config) {
  try {
    const registration = await navigator.serviceWorker.register(swUrl);
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (installingWorker == null) {
        return;
      }
      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New content is available and will be used when all tabs for this page are closed
            console.log(
              'New content is available and will be used when all ' +
                'tabs for this page are closed. See https://bit.ly/CRA-PWA.'
            );
            if (config?.onUpdate) {
              config.onUpdate(registration);
            }
          } else {
            console.log('Content is cached for offline use.');
            if (config?.onSuccess) {
              config.onSuccess(registration);
            }
          }
        }
      };
    };
  } catch (error) {
    console.error('Error during service worker registration:', error);
  }
}

async function checkValidServiceWorker(swUrl, config) {
  try {
    const response = await fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    });
    const contentType = response.headers.get('content-type');
    if (
      response.status === 404 ||
      (contentType != null && contentType.indexOf('javascript') === -1)
    ) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.unregister().then(() => {
          window.location.reload();
        });
      });
    } else {
      registerValidSW(swUrl, config);
    }
  } catch (error) {
    console.log('No internet connection found. App is running in offline mode.');
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
