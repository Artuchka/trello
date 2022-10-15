import { v4 as uuidv4 } from "./_snowpack/pkg/uuid.js"

const listTemplate = document.querySelector("template#list")
const taskTemplate = document.querySelector("template#task")

const listContainer = document.querySelector("[data-listContainer]")
const addListBtn = document.querySelector("[data-addListBtn]")

restore()

if (listContainer.innerHTML === "") {
	addList("Awesome List")
}
addListBtn.addEventListener("click", (e) => {
	addList("new list")
})
function addList(title = "list title") {
	const clone = listTemplate.content.cloneNode(true)

	const titleElement = clone.querySelector("[data-title]")

	titleElement.value = title

	const taskContainer = clone.querySelector("[data-taskList]")
	clone
		.querySelector("[data-input]")
		.addEventListener("keydown", function (e) {
			if (e.key == "Enter") {
				addTask(taskContainer, { text: this.value, id: uuidv4() })
				this.value = ""
				save()
			}
		})
	titleElement.addEventListener("input", (e) => {
		adjustTextareaHeight(titleElement)
		save()
	})
	taskContainer.addEventListener("contextmenu", (e) => {
		e.preventDefault()
		if (e.target.matches(".task")) {
			e.target.remove()
		}

		save()
	})

	taskContainer.ondrop = dragdrop
	taskContainer.ondragover = dragover
	taskContainer.ondragleave = dragleave

	listContainer.append(clone)

	adjustTextareaHeight(titleElement)

	return taskContainer
}

function addTask(container, taskDetails) {
	const clone = taskTemplate.content.cloneNode(true)
	const parent = clone.querySelector(".task")
	parent.querySelector("[data-info]").textContent = taskDetails.text
	parent.id = taskDetails.id
	parent.addEventListener("dragstart", (e) => dragstart(e))
	container.append(clone)
}
function save() {
	const lists = Array.from(document.querySelectorAll(".list"))
	const data = lists.map((list) => {
		const tasks = Array.from(
			list.querySelectorAll(".task > span[data-info]")
		)
		const title = list.querySelector("[data-title]").value
		console.log(title)
		return {
			listTitle: title,
			tasks: tasks.map((task) => {
				console.log(task.parentNode.id)
				return {
					text: task.textContent,
					id: task.parentNode.id,
				}
			}),
		}
	})

	console.log(data)
	localStorage.setItem(`TASKS_APP_INFO`, JSON.stringify(data))
}
function restore() {
	const data = JSON.parse(localStorage.getItem(`TASKS_APP_INFO`))
	console.log(data)
	if (!data) return
	data.forEach((list) => {
		const taskContainer = addList(list.listTitle)
		list.tasks.forEach((taskDetails) => {
			addTask(taskContainer, taskDetails)
		})
	})
}

function dragstart(e) {
	e.dataTransfer.setData("text/plain", e.target.id)
}

function dragover(e) {
	e.preventDefault()
	e.target.classList.add("dragover")
}
function dragleave(e) {
	e.preventDefault()
	e.target.classList.remove("dragover")
}
function dragdrop(e) {
	e.preventDefault()
	e.target.classList.remove("dragover")
	const taskId = e.dataTransfer.getData("text/plain")

	e.target.append(document.getElementById(taskId))

	save()
}

function adjustTextareaHeight(element) {
	element.style.height = "1px"
	element.style.height = `calc(1px * ${element.scrollHeight})`
}
