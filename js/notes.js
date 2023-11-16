export default class StickyNotes {
	constructor(root) {
		this.root = root;
		this.root.innerHTML = StickyNotes.getHTML();

		this.el = {
			addNoteButton: root.querySelector(".add"),
			searchBar: root.querySelector("#search"),
			noteContainer: root.querySelector(".notes-container"),
			noteEditContainer: this.root.parentElement.querySelector(
				".sticky-notes-edit-container"
			),
		};

		this.el.addNoteButton.addEventListener("click", () => {
			this.addNotes();
		});

		this.el.searchBar.addEventListener("input", (e) => {
			this.searchNotes(e.target.value.toLowerCase());
		});

		this.displayNotes();
	}

	displayNotes() {
		let data = this.getNotes();

		if (data.length != 0) {
			this.getNotes().forEach((note) => {
				let noteElement = this.createNoteElement(
					note.id,
					note.updatedAt,
					note.content
				);

				this.el.noteContainer.appendChild(noteElement);
			});
		} else {
			this.addNotes();
		}
	}

	searchNotes(value) {
		for (let i = 0; i < this.el.noteContainer.children.length; i++) {
			let isVisible = this.el.noteContainer.children[
				i
			].children[1].textContent
				.toLowerCase()
				.includes(value);

			this.el.noteContainer.children[i].classList.toggle(
				"hide",
				!isVisible
			);
		}
	}

	updatedAt() {
		let hours = new Date().getHours().toString().padStart(2, "0");
		let minutes = new Date().getMinutes().toString().padStart(2, "0");

		return `${hours}:${minutes}`;
	}

	getNotes() {
		return JSON.parse(localStorage.getItem("sticky-notes-data"), "[]");
	}

	addNotes() {
		let id = Math.floor(Math.random() * 100000);
		let updatedAt = this.updatedAt();
		let content = ``;

		let noteElement = this.createNoteElement(id, updatedAt, content);

		this.el.noteContainer.prepend(noteElement);
	}

	createNoteElement(id, updatedAt, content) {
		let noteCard = this.root
			.querySelector(".note-card-template")
			.content.cloneNode(true).children[0];

		let timeElement = noteCard.querySelector(".time");
		let bodyElement = noteCard.querySelector(".content");

		noteCard.id = id;
		timeElement.textContent = updatedAt;
		bodyElement.textContent = content;

		let numberOfRows = this.getRows(bodyElement.textContent.length);
		bodyElement.setAttribute("rows", numberOfRows);

		noteCard.addEventListener("dblclick", (e) => {
			for (
				let i = 0;
				i < this.el.noteEditContainer.children.length;
				i++
			) {
				if (this.el.noteEditContainer.children[i].id == id) {
					this.el.noteEditContainer.removeChild(
						this.el.noteEditContainer.children[i]
					);
				}
			}

			this.createNoteEditElement(
				noteCard.id,
				bodyElement.textContent,
				timeElement,
				bodyElement
			);
		});

		return noteCard;
	}

	createNoteEditElement(id, content, noteTimeElement, noteBodyElement) {
		let noteEditCard = this.root
			.querySelector(".note-edit-card-template")
			.content.cloneNode(true).children[0];

		let deleteButton = noteEditCard.querySelector(".delete");
		let saveButton = noteEditCard.querySelector(".save");
		let closeButton = noteEditCard.querySelector(".close");
		let bodyElement = noteEditCard.querySelector("#content");

		noteEditCard.id = id;
		bodyElement.textContent = content;

		deleteButton.addEventListener("click", () => {
			this.el.noteContainer.removeChild(noteBodyElement.parentElement);
			this.el.noteEditContainer.removeChild(noteEditCard);

			this.deleteNotes(id);
		});

		closeButton.addEventListener("click", () => {
			if (bodyElement.textContent.length == 0) {
				this.el.noteContainer.removeChild(
					noteBodyElement.parentElement
				);
			}

			this.el.noteEditContainer.removeChild(noteEditCard);
		});

		bodyElement.addEventListener("input", (e) => {
			noteTimeElement.textContent = this.updatedAt();
			noteBodyElement.textContent = e.target.value;

			bodyElement.textContent = e.target.value;

			saveButton.classList.remove("hide");
			saveButton.style.animation = `loading 1s linear`;

			setTimeout(() => {
				saveButton.classList.add("hide");
			}, 1000);

			let numberOfRows = this.getRows(e.target.value.length);
			noteBodyElement.setAttribute("rows", numberOfRows);

			this.el.noteContainer.prepend(noteBodyElement.parentElement);

			if (bodyElement.textContent.length != 0) {
				this.updateNotes(
					noteEditCard.id,
					this.updatedAt(),
					bodyElement.textContent
				);
			} else {
				this.deleteNotes(noteEditCard.id);
			}
		});

		this.root.parentElement
			.querySelector(".sticky-notes-edit-container")
			.prepend(noteEditCard);
	}

	getRows(length) {
		return length >= 32 ? Math.ceil(length / 32) : 1;
	}

	updateNotes(id, time, content) {
		let data = this.getNotes();

		for (var i = 0; i < data.length; i++) {
			if (data[i].id == id) {
				data.splice(i, 1);
			}
		}

		let newData = {
			id,
			updatedAt: time,
			content,
		};

		data.unshift(newData);

		localStorage.setItem("sticky-notes-data", JSON.stringify(data));
	}

	deleteNotes(id) {
		let data = this.getNotes();

		for (var i = 0; i < data.length; i++) {
			if (data[i].id == id) {
				data.splice(i, 1);
			}
		}

		localStorage.setItem("sticky-notes-data", JSON.stringify(data));
	}

	static getHTML() {
		return `
			<button type="button" class="add">
				<span class="material-symbols-sharp"> add </span>
			</button>

			<h2 class="heading">Sticky Notes</h2>

			<input
				type="text"
				name="search"
				id="search"
				placeholder="Search..."
			/>

			<div class="notes-container"></div>
			
			<template class="note-card-template">
				<div class="note noselect">
					<div class="time"></div>
					<textarea class="content" placeholder="Take a note..." disabled></textarea>
				</div>
			</template>

			<template class="note-edit-card-template">
				<div class="edit-note">
					<div class="buttons">
						<div class="left">
							<button type="button" class="delete">
								<span class="material-symbols-sharp"> delete </span>
							</button>
						</div>
						<div class="right">
							<button type="button" class="save hide">
								<span class="material-symbols-sharp"> cached </span>
							</button><button type="button" class="close">
								<span class="material-symbols-sharp"> close </span>
							</button>
						</div>
					</div>

					<textarea
						name="content"
						id="content"
						placeholder="Take a note..."
					></textarea>
				</div>
			</template>
		`;
	}
}
