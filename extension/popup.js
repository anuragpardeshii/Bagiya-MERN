const form = document.querySelector('#connection');
const input = document.querySelector('#origin');
const status = document.querySelector('#status');
const error = document.querySelector('#error');
chrome.runtime
  .sendMessage({ action: 'STATUS' })
  .then(({ data, error: problem }) => {
    if (problem) throw new Error(problem);
    input.value = data.appOrigin;
    status.textContent = data.status;
    input.disabled = data.active;
    form.querySelector('button').disabled = data.active;
  })
  .catch((problem) => {
    error.textContent = problem.message;
  });
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  error.textContent = '';
  try {
    const url = new URL(input.value);
    const granted = await chrome.permissions.request({
      origins: [`${url.protocol}//${url.hostname}/*`],
    });
    if (!granted) throw new Error('Site access is needed to connect Bagiya.');
    const response = await chrome.runtime.sendMessage({
      action: 'CONFIGURE',
      origin: url.origin,
    });
    if (response.error) throw new Error(response.error);
    await chrome.tabs.create({ url: `${response.data.appOrigin}/timer` });
    window.close();
  } catch (problem) {
    error.textContent = problem.message;
  }
});
