export function loadFonts() {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap'
  document.head.appendChild(link)
  
  const linkIcons = document.createElement('link')
  linkIcons.rel = 'stylesheet'
  linkIcons.href = 'https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css'
  document.head.appendChild(linkIcons)
}
