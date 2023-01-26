import { GithubUser } from "./githubUser.js"

// classe que vai conter a lógica dos dados
// como os dados serão estruturados
export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root) // this.root é o #app
        this.load()
        this.empty()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites2:')) || []
    }

    save() {
        localStorage.setItem('@github-favorites2:', JSON.stringify(this.entries))
        this.empty()
    }

    empty() {
        const noUser = document.querySelector(".noFav")

        if (this.entries.length === 0) {
            noUser.classList.remove('hide')
        }
        else {
            noUser.classList.add('hide')
        }

    }

    async add(username) {
        try {

            const userExists = this.entries.find(entry => entry.login === username)

            if (userExists) {
                throw new Error('Usuário já cadastrado!')
            }

            const user = await GithubUser.search(username) // espera a promessa ser terminada
            
            if(user.login === undefined) {
                throw new Error('Usuário não encontrado!')
            }
        
            this.entries = [user, ...this.entries] // adiciona o novo usuario a lista com os outros usuarios (spread) tipo um push
            this.update()
            this.save()

        } catch (error) {
            alert(error.message)
        }
    }

    delete(user) {
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login) // se retornar false, o filter exclui o user passado
                                                                                        // o user que for igual ao passado é deletado

        this.entries = filteredEntries
        this.update()
        this.save()
    }
}

// classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onadd()
    }

    onadd() {
        const addButton = this.root.querySelector('.search button')
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')

            this.add(value)
        }
    }

    update() {
        this.removeAllTr()

        this.entries.forEach( user => {
            const row = this.createRow()

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = `/${user.login}`
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers

            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja deletar essa linha?') // alert
                if (isOk) {
                   this.delete(user) 
                }
            }

            this.tbody.prepend(row)
        })
    }

    createRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = `
                    <td class="user">
                        <img src="https://github.com/maykbrito.png" alt="Imagem de Mayk Brito">
                        <a href="https://github.com/maykbrito" target="_blank">
                            <p>Mayk Brito</p>
                            <span>maykbrito</span>
                        </a>
                    </td>
                    <td class="repositories">
                        76
                    </td>
                    <td class="followers">
                        9589
                    </td>
                    <td>
                        <button class="remove">Remover</button>
                    </td>
        `

        return tr
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr')
            .forEach((tr) => {
                tr.remove()
            })
    }
}

const form = document.querySelector(".search")
const input = document.querySelector('input')

form.addEventListener("submit", (event) => {
    event.preventDefault()
    input.value = ""
})