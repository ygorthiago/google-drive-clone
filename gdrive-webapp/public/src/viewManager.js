export default class ViewManager {
  constructor() {
    this.tbody = document.getElementById('tbody')
  }

  getIcon(file) {
    return file.match(/.\mp4/i) ? 'movie'
      : file.match(/\.jp|png/i) ? 'image' : 'content_copy'
  }
  
  makeIcon(file) {
    const icon = this.getIcon(file)
    const colors = {
      image: 'yellow600',
      movie: 'red600',
      file: ''
    }

    return `<i class="material-icons ${colors[icon]} left">${icon}</i>`
  }

  updateCurrentFiles(files) {
    const dateOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric' 
    }

    const template = (item) => `
      <tr>
        <td>${this.makeIcon(item.file)} ${item.file}</td>
        <td>${item.owner}</td>
        <td>${new Date(item.lastModified).toLocaleDateString('pt-BR', dateOptions)}</td>
        <td>${item.size}</td>
      </tr>
    `

    this.tbody.innerHTML = files.map(template).join('')
  }
}