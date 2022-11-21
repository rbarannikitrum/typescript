interface ISpendObj {
    place: string
    price: number
    time: string
    permanentTime: string
    __v?: number
    _id?: string
}

interface IHeaders {
    [key: string]: string
}

////////////////////
////////////////////
////////////////////

interface IBase {
    total: number
    spendArr : Array<ISpendObj>
    spends : HTMLElement
    serverError: string
    userError: string
}

abstract class BaseClass implements IBase{
    total: number = 0
    spendArr: Array<ISpendObj> = []
    spends: HTMLElement = document.querySelector('#all_spends') as HTMLElement
    serverError: string = 'Ошибка в получении данных с сервера'
    userError: string = 'Введите корректные данные'
}

class FetchMethods extends BaseClass {
    headers: IHeaders = {"Content-Type": "application/json;charset=utf-8", "Access-Control-Allow-Origin": "*"}
     async get(): Promise<Array<ISpendObj>> {
        return this.spendArr = await fetch('http://localhost:8000/allSpends',
            {
                method: 'GET'
            }).then(res => res.json())

    }
     async add(where: string, howMany: number): Promise<ISpendObj> {
        return await fetch('http://localhost:8000/create', {
            method: 'POST',
            body: JSON.stringify({place: where, price: howMany}),
            headers : this.headers
        }).then(res => res.json()).then(res => res.data)
    }
     async patch(i: number): Promise<ISpendObj> {
        return await fetch('http://localhost:8000/update', {
            method: 'PATCH',
            body: JSON.stringify({
                _id: this.spendArr[i]._id,
                place: this.spendArr[i].place,
                time: this.spendArr[i].time,
                price: this.spendArr[i].price,
                permanentTime: this.spendArr[i].permanentTime
            }),
            headers : this.headers
        }).then(res => res.json())
    }
     async delete(id: string): Promise<boolean> {
        const response = await fetch(`http://localhost:8000/delete?_id=${id}`, {method: 'DELETE'})
        return response.status === 200;
    }
}

const fetchMethods: FetchMethods = new FetchMethods()

class TaskActions extends BaseClass {
    // получение данных
    async fetchData(): Promise<void> {
        try {
            this.setLoader()
            this.spendArr = await fetchMethods.get()
            this.render()
        } catch (error) {
            this.setError(this.serverError)
        } finally {
            this.deleteLoader()
        }
    }
    // добавить трату
    async addSpend(): Promise<void> {
        let howMany: number = Number((document.querySelector('#howMany') as HTMLInputElement).value)
        howMany = Number(howMany.toFixed(2))
        let where: string = (document.querySelector('#where') as HTMLInputElement).value.trim()
        if (!where || !howMany || howMany > 9999999 || howMany <= 0) {
            return this.setError(this.userError)
        }
        try {
            await fetchMethods.add(where, howMany)
            this.spendArr = await fetchMethods.get()
            this.render()
        } catch (error) {
            this.setError(this.serverError)
        }
        (document.querySelector('#where') as HTMLInputElement).value = '';
        (document.querySelector('#howMany') as HTMLInputElement).value = ''
    }
    // добавить трату на enter
    async setEnter(event: KeyboardEvent): Promise<void> {
        if (event.keyCode === 13) {
            event.preventDefault()
            await this.addSpend()
        }
    }
    // сохранить изменения на все
    async saveChangesForAll(i: number): Promise<void> {
        let editPriceInput: number = Number((document.querySelector(`#edit_price_input-${i}`) as HTMLInputElement).value)
        let editWhereInput = (document.querySelector(`#edit_place_input-${i}`) as HTMLInputElement).value.trim()
        editPriceInput = Number(Number(editPriceInput).toFixed(2))
        let editTimeInput = (document.querySelector(`#edit_time_input-${i}`) as HTMLInputElement).value
        const time: Date = new Date(editTimeInput)
        const permTime = new Date(this.spendArr[i].permanentTime)
        if (editPriceInput <= 0 ||
            editPriceInput > 9999999 ||
            editWhereInput === '' ||
            Math.abs(time.getTime() - permTime.getTime()) / (60 * 60 * 24 * 1000) > 7) {
            return this.setError(this.userError)
        }

        if (editWhereInput || editPriceInput) {
            try {
                const checkVar = this.spendArr[i]
                if (checkVar) {
                    checkVar.place = editWhereInput
                    checkVar.time = editTimeInput
                    checkVar.price = editPriceInput
                }
                await fetchMethods.patch(i)
                this.spendArr = await fetchMethods.get()
                this.render()
            } catch (error) {
                this.setError(this.serverError)
            }
        } else this.render()
    }
    // сохранить изменения на один инпут
    async saveChanges(elem: string): Promise<void> {
        const i: number = Number(elem.split('-')[1])
        const type = String(elem.split('-')[0])
        const editInput = this.getInput(elem)
        if (Number(editInput) === 0 || Number(editInput) > 9999999) {
            return this.setError(this.userError)
        }

        if (type && Math.abs(new Date(editInput).getTime() - new Date(this.spendArr[i].permanentTime).getTime()) / (60 * 60 * 24 * 1000) > 7) {
            return this.setError(this.userError)
        }

        const element = this.spendArr[i]
        if (element) {
            if (type === 'place') {
                element.place = editInput
            }
            if (type === 'time') {
                element.time = editInput
            }
            if (type === 'price') {
                element.price = Number(editInput)
            }
        }


        try {
            console.log(1)
            await fetchMethods.patch(i)
            console.log(2)
            this.spendArr = await fetchMethods.get()
            console.log(3)
            this.render()
        } catch (error) {
            this.setError(this.serverError)
        }
    }
    // удалить
    async deleteElement(id: string): Promise<void> {
        try {
            await fetchMethods.delete(id)
            this.spendArr = await fetchMethods.get()
            this.render()
        } catch (error) {
            this.setError(this.serverError)
        }
    }
    // открыть редактирование на 1 инпут
    setEdit(elem: string) {
        const inputType = elem.split('-')[0]
        let i: number = Number(elem.split('-')[1])
        document.removeEventListener('keyup', this.setEnter)
        this.render()
        let field: HTMLElement = document.querySelector(`#${elem}`) as HTMLElement
        const task = field.parentNode as HTMLElement
        task.className = 'task';
        field.remove()
        const temp = this.spendArr[i]
        const input = document.createElement('input')
        if (inputType === 'price') {
            input.type = 'number'
            if (temp) {
                input.value = String(temp.price)
            }
        } else if (inputType === 'time') {
            input.type = 'date'
            if (temp) {
                input.valueAsDate = new Date(temp.time)
            }
        } else {
            input.type = 'text'
            if (temp) {
                input.value = temp.place
            }
        }

        input.classList.add('input_edit')
        input.id = `edit-${inputType}-${i}`
        task.appendChild(input)
        task.addEventListener('focusout', () => this.render())

        input.addEventListener('keyup', async (event: KeyboardEvent) => {
            if (event.keyCode === 13) {
                event.preventDefault()
                await this.saveChanges(elem)
            }
        })
    }
    // открыть окно редактирование на 3 инпута
    openEdit(i: number) {
        this.render()
        const task = document.querySelector(`#task-${i}`) || null
        if (task) {
            task.innerHTML = ''
        }
        const editPlaceInput = document.createElement('input')
        editPlaceInput.placeholder = 'Где'
        editPlaceInput.maxLength = 300
        editPlaceInput.id = `edit_place_input-${i}`
        const temp = this.spendArr[i]
        if (temp) {
            editPlaceInput.value = temp.place
        }
        editPlaceInput.classList.add('input_edit')
        if (task) {
            task.appendChild(editPlaceInput)
        }


        const editTimeInput = document.createElement('input')
        editTimeInput.id = `edit_time_input-${i}`
        editTimeInput.type = 'date'
        if (temp) {
            editTimeInput.valueAsDate = new Date(temp.time)
        }
        editTimeInput.classList.add('input_edit')
        if (task) {
            task.appendChild(editTimeInput)
        }


        const editPriceInput = document.createElement('input')
        editPriceInput.placeholder = 'Потрачено'
        editPriceInput.id = `edit_price_input-${i}`
        editPriceInput.type = 'number'
        editPriceInput.classList.add('input_edit')
        if (temp) {
            editPriceInput.value = String(temp.price)
        }
        if (task) {
            task.appendChild(editPriceInput)
        }


        const saveButton = document.createElement('button')
        saveButton.textContent = 'Сохранить'
        saveButton.classList.add('btn')
        saveButton.addEventListener('click', () => this.saveChangesForAll(i))
        if (task) {
            task.appendChild(saveButton)
        }


        const cancelButton = document.createElement('button')
        cancelButton.textContent = 'Отмена'
        cancelButton.classList.add('btn')
        cancelButton.addEventListener('click', () => this.render())
        if (task) {
            task.appendChild(cancelButton)
        }

    }
    // получить один инпут
    getInput(elem: string): string {
        let editInput: string = (document.querySelector(`#edit-${elem}`) as HTMLInputElement).value
        if (elem.split('-')[0] === 'price') {
            editInput = Number(editInput).toFixed(2)
        }

        if (Number(editInput) <= 0) {
            this.setError(this.userError)
        }
        return editInput
    }
    // создать ошибку
    setError(error: string) {
        if (!document.querySelector('.error')) {
            const errorDiv = document.createElement('div')
            errorDiv.classList.add('error')
            const errorText = document.createElement('span')
            errorText.textContent = error
            errorDiv.appendChild(errorText)
            if (this.spends) {
                this.spends.prepend(errorDiv)
            }
            setTimeout(() => {
                errorDiv.remove()
            }, 5000)
        }
    }
    // создать лоадер
    setLoader() {
        const ring = document.createElement('div')
        ring.id = 'ring'
        ring.classList.add('lds-ring')
        if(this.spends) {
            this.spends.before(ring)
        }

        let firstDiv = document.createElement('div')
        ring.appendChild(firstDiv)

        let secondDiv = document.createElement('div')
        ring.appendChild(secondDiv)

        let thirdDiv = document.createElement('div')
        ring.appendChild(thirdDiv)

        let fourthDiv = document.createElement('div')
        ring.appendChild(fourthDiv)
    }
    // удалить лоадер
    deleteLoader() {
        const ring = document.getElementById('ring') || null
        if (ring) {
            ring.remove()
        }
    }
    // подсчет общей суммы
    reduceTotal() {
        this.total = this.spendArr.reduce((accum, el) => accum + el.price, 0)
    }
    // проверка на пустой массив
    checkEmpty() {
        if (this.spendArr.length === 0) {
            const emptyDiv = document.createElement('div')
            emptyDiv.classList.add('empty')
            const emptyText = document.createElement('span')
            emptyText.textContent = 'Список трат пуст'
            emptyDiv.appendChild(emptyText)
            if (this.spends) {
                this.spends.appendChild(emptyDiv)
            }
        }
    }
    // рендер
    render() {
        if (this.spends) {
            this.spends.innerHTML = ''
        }
        const sum = document.createElement('div')
        sum.classList.add('sum')
        this.reduceTotal()
        sum.textContent = `Всего денег потрачено было : ${this.total} рублей`

        this.checkEmpty()

        this.spendArr.forEach((el, i) => {
            // вся задача
            const container = document.createElement('div')
            container.id = `task-${i}`
            container.classList.add('container_task')


            const placeContainer = document.createElement('div')
            placeContainer.classList.add('element')
            container.appendChild(placeContainer)


            const place = document.createElement('span')
            place.textContent = `${el.place}`
            place.addEventListener('click', () => this.setEdit(place.id))
            placeContainer.appendChild(place)
            place.id = `place-${i}`


            const timeContainer = document.createElement('div')
            timeContainer.classList.add('element')
            container.appendChild(timeContainer)


            const time = document.createElement('span')
            time.textContent = `${new Date(el.time).toLocaleDateString('ru-ru')}`
            timeContainer.appendChild(time)
            time.addEventListener('click', () => this.setEdit(time.id))
            time.id = `time-${i}`

            const priceContainer = document.createElement('div')
            container.appendChild(priceContainer)
            priceContainer.classList.add('element')


            const price = document.createElement('span')
            price.textContent = `${el.price} ₽`
            price.addEventListener('click', () => this.setEdit(price.id))
            priceContainer.appendChild(price)
            price.id = `price-${i}`

            const deleteEl = document.createElement('button')
            deleteEl.textContent = 'Удалить'
            deleteEl.addEventListener('click', async () => {
                if (el._id) {
                    await this.deleteElement(el._id)
                }

            })
            container.appendChild(deleteEl)
            deleteEl.classList.add('btn')
            deleteEl.id = `delete-${i}`

            const editTask = document.createElement('button')
            editTask.textContent = 'Изменить'
            container.appendChild(editTask)
            editTask.classList.add('btn')
            editTask.classList.add('edit_btn')
            editTask.id = `edit-${i}`
            editTask.addEventListener('click', (event) => {
                event.stopPropagation()
                this.openEdit(i)
            })

            // див со всеми задачами
            if (this.spends) {
                this.spends.appendChild(container)
                this.spends.appendChild(sum)
            }

        })
    }
}
const taskActions: TaskActions = new TaskActions()
document.addEventListener('keyup', taskActions.setEnter)


////////////////////
////////////////////
////////////////////

// получение задачек

// добавить задачу

// добавление задачи на enter

// сохранить изменения в случае когда открывается 3 инпута

// получить инпут когда открыто одно поле ввода

// сохранить изменения когда открыто одно поле ввода

// удалить задачу

// открыть окно редактирования с одним полем ввода

// открыть окно редактирования с 3 полями ввода


// создал лоадер


// удалил лоадер

// создание ошибки


// подсчет общей суммы


// проверка на отсутствие задач


// рендер
