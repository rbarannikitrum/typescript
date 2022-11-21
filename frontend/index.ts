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
    total : number
    spendArr : Array<ISpendObj>
    spends : HTMLElement
    serverError: string
    userError: string
    headers : IHeaders
}

abstract class BaseClass implements IBase{
    total: number = 0
    spendArr: Array<ISpendObj> = []
    spends: HTMLElement = document.querySelector('#all_spends') as HTMLElement
    serverError: string = 'Ошибка в получении данных с сервера'
    userError: string = 'Введите корректные данные'
    headers: IHeaders = {"Content-Type": "application/json;charset=utf-8", "Access-Control-Allow-Origin": "*"}
}

class FetchMethods extends BaseClass {
     constructor() {
        super();
    }

    async get(): Promise<Array<ISpendObj>> {
        return await fetch('http://localhost:8000/allSpends',
            {
                method: 'GET'
            }).then(res => res.json())

    }

     async add(where: string, howMany: number): Promise<ISpendObj> {
        return await fetch('http://localhost:8000/create', {
            method: 'POST',
            body: JSON.stringify({place: where, price: howMany}),
            headers
        }).then(res => res.json()).then(res => res.data)
    }

     async patch(i: number): Promise<ISpendObj> {
        return await fetch('http://localhost:8000/update', {
            method: 'PATCH',
            body: JSON.stringify({
                _id: spendArr[i]._id,
                place: spendArr[i].place,
                time: spendArr[i].time,
                price: spendArr[i].price,
                permanentTime: spendArr[i].permanentTime
            }),
            headers
        }).then(res => res.json())
    }

     async delete(id: string): Promise<boolean> {
        const response = await fetch(`http://localhost:8000/delete?_id=${id}`, {method: 'DELETE'})
        return response.status === 200;
    }
}

const fetchMethods: FetchMethods = new FetchMethods()

class TaskActions extends BaseClass {
    async addSpend(): Promise<void> {
        let howMany: number = Number((document.querySelector('#howMany') as HTMLInputElement).value)
        howMany = Number(howMany.toFixed(2))
        let where: string = (document.querySelector('#where') as HTMLInputElement).value.trim()
        if (!where || !howMany || howMany > 9999999 || howMany <= 0) {
            return setError(userError)
        }
        try {
            await fetchMethods.add(where, howMany)
            spendArr = await fetchMethods.get()
            render()
        } catch (error) {
            setError(serverError)
        }
        (document.querySelector('#where') as HTMLInputElement).value = '';
        (document.querySelector('#howMany') as HTMLInputElement).value = ''
    }
}

////////////////////
////////////////////
////////////////////


let total: number = 0
let spendArr: ISpendObj[] = [];
const spends = document.querySelector<HTMLInputElement>('#all_spends')
let spendsValue
if (spends) {
     spendsValue = spends.value
}

const serverError: string = 'Ошибка в получении данных с сервера'
const userError: string = 'Введите корректные данные'
const headers: IHeaders = {"Content-Type": "application/json;charset=utf-8", "Access-Control-Allow-Origin": "*"}

async function getReq(): Promise<Array<ISpendObj>> {
    return spendArr = await fetch('http://localhost:8000/allSpends',
        {
            method: 'GET'
        }).then(res => res.json())
}

async function createReq(where: string, howMany: number): Promise<ISpendObj> {
    return await fetch('http://localhost:8000/create', {
        method: 'POST',
        body: JSON.stringify({place: where, price: howMany}),
        headers
    }).then(res => res.json()).then(res => res.data)
}

async function patchReq(i: number): Promise<ISpendObj> {
    return await fetch('http://localhost:8000/update', {
        method: 'PATCH',
        body: JSON.stringify({
            _id: spendArr[i]._id,
            place: spendArr[i].place,
            time: spendArr[i].time,
            price: spendArr[i].price,
            permanentTime: spendArr[i].permanentTime
        }),
        headers
    }).then(res => res.json())

}

async function deleteReq(id: string): Promise<boolean> {
    const response = await fetch(`http://localhost:8000/delete?_id=${id}`, {method: 'DELETE'})
    return response.status === 200;
}

// получение задачек
async function fetchData(): Promise<void> {
    try {
        setLoader()
        spendArr = await fetchMethods.get()
        render()
    } catch (error) {
        setError(serverError)
    } finally {
        deleteLoader()
    }
}

// добавить задачу
async function addSpend(): Promise<void> {
    let howMany: number = Number((document.querySelector('#howMany') as HTMLInputElement).value)
    howMany = Number(howMany.toFixed(2))
    let where: string = (document.querySelector('#where') as HTMLInputElement).value.trim()
    if (!where || !howMany || howMany > 9999999 || howMany <= 0) {
        return setError(userError)
    }
    try {
        await fetchMethods.add(where, howMany)
        spendArr = await fetchMethods.get()
        render()
    } catch (error) {
        setError(serverError)
    }
    (document.querySelector('#where') as HTMLInputElement).value = '';
    (document.querySelector('#howMany') as HTMLInputElement).value = ''
}

// добавление задачи на enter
async function setEnter(event: KeyboardEvent): Promise<void> {
    if (event.keyCode === 13) {
        event.preventDefault()
        await addSpend()
    }
}

document.addEventListener('keyup', setEnter)

// сохранить изменения в случае когда открывается 3 инпута
async function saveChangesForAll(i: number): Promise<void> {
    let editPriceInput: number = Number((document.querySelector(`#edit_price_input-${i}`) as HTMLInputElement).value)
    let editWhereInput = (document.querySelector(`#edit_place_input-${i}`) as HTMLInputElement).value.trim()
    editPriceInput = Number(Number(editPriceInput).toFixed(2))
    let editTimeInput = (document.querySelector(`#edit_time_input-${i}`) as HTMLInputElement).value
    const time: Date = new Date(editTimeInput)
    const permTime = new Date(spendArr[i].permanentTime)
    if (editPriceInput <= 0 ||
        editPriceInput > 9999999 ||
        editWhereInput === '' ||
        Math.abs(time.getTime() - permTime.getTime()) / (60 * 60 * 24 * 1000) > 7) {
        return setError(userError)
    }

    if (editWhereInput || editPriceInput) {
        try {
            const checkVar = spendArr[i]
            if (checkVar) {
                checkVar.place = editWhereInput
                checkVar.time = editTimeInput
                checkVar.price = editPriceInput
            }
            await fetchMethods.patch(i)
            spendArr = await fetchMethods.get()
            render()
        } catch (error) {
            setError(serverError)
        }
    } else render()
}

// получить инпут когда открыто одно поле ввода
function getInput(elem: string): string {
    let editInput: string = (document.querySelector(`#edit-${elem}`) as HTMLInputElement).value
    if (elem.split('-')[0] === 'price') {
        editInput = Number(editInput).toFixed(2)
    }

    if (Number(editInput) <= 0) {
        setError(userError)
    }
    return editInput
}


// сохранить изменения когда открыто одно поле ввода
async function saveChanges(elem: string): Promise<void> {
    const i: number = Number(elem.split('-')[1])
    const type = String(elem.split('-')[0])
    const editInput = getInput(elem)
    if (Number(editInput) === 0 || Number(editInput) > 9999999) {
        return setError(userError)
    }

    if (type && Math.abs(new Date(editInput).getTime() - new Date(spendArr[i].permanentTime).getTime()) / (60 * 60 * 24 * 1000) > 7) {
        return setError(userError)
    }

    const element = spendArr[i]
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
        await fetchMethods.patch(i)
        spendArr = await fetchMethods.get()
        render()
    } catch (error) {
        setError(serverError)
    }
}

// удалить задачу
async function deleteElement(id: string): Promise<void> {
    try {
        await fetchMethods.delete(id)
        spendArr = await fetchMethods.get()
        render()
    } catch (error) {
        setError(serverError)
    }
}

// открыть окно редактирования с одним полем ввода
function setEdit(elem: string) {
    const inputType = elem.split('-')[0]
    let i: number = Number(elem.split('-')[1])
    document.removeEventListener('keyup', setEnter)
    render()
    let field: HTMLElement = document.querySelector(`#${elem}`) as HTMLElement
    const task = field.parentNode as HTMLElement
    task.className = 'task';
    field.remove()
    const temp = spendArr[i]
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
    task.addEventListener('focusout', () => render())

    input.addEventListener('keyup', async (event: KeyboardEvent) => {
        if (event.keyCode === 13) {
            event.preventDefault()
            await saveChanges(elem)
        }
    })
}

// открыть окно редактирования с 3 полями ввода
function openEdit(i: number) {
    render()
    const task = document.querySelector(`#task-${i}`) || null
    if (task) {
        task.innerHTML = ''
    }
    const editPlaceInput = document.createElement('input')
    editPlaceInput.placeholder = 'Где'
    editPlaceInput.maxLength = 300
    editPlaceInput.id = `edit_place_input-${i}`
    const temp = spendArr[i]
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
    saveButton.addEventListener('click', () => saveChangesForAll(i))
    if (task) {
        task.appendChild(saveButton)
    }


    const cancelButton = document.createElement('button')
    cancelButton.textContent = 'Отмена'
    cancelButton.classList.add('btn')
    cancelButton.addEventListener('click', () => render())
    if (task) {
        task.appendChild(cancelButton)
    }

}

// создал лоадер
function setLoader() {
    const ring = document.createElement('div')
    ring.id = 'ring'
    ring.classList.add('lds-ring')
    if(spends) {
        spends.before(ring)
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

// удалил лоадер
function deleteLoader() {
    const ring = document.getElementById('ring') || null
    if (ring) {
        ring.remove()
    }

}
// создание ошибки
function setError(error: string) {
    if (!document.querySelector('.error')) {
        const errorDiv = document.createElement('div')
        errorDiv.classList.add('error')
        const errorText = document.createElement('span')
        errorText.textContent = error
        errorDiv.appendChild(errorText)
        if (spends) {
            spends.prepend(errorDiv)
        }
        setTimeout(() => {
            errorDiv.remove()
        }, 5000)
    }

}

// подсчет общей суммы
function reduceTotal() {
    total = spendArr.reduce((accum, el) => accum + el.price, 0)
}

// проверка на отсутствие задач
function checkEmpty() {
    if (spendArr.length === 0) {
        const emptyDiv = document.createElement('div')
        emptyDiv.classList.add('empty')
        const emptyText = document.createElement('span')
        emptyText.textContent = 'Список трат пуст'
        emptyDiv.appendChild(emptyText)
        if (spends) {
            spends.appendChild(emptyDiv)
        }
    }
}

// рендер
function render() {
    if (spends) {
        spends.innerHTML = ''
    }
    const sum = document.createElement('div')
    sum.classList.add('sum')
    reduceTotal()
    sum.textContent = `Всего денег потрачено было : ${total} рублей`

    checkEmpty()

    spendArr.forEach((el, i) => {
        // вся задача
        const container = document.createElement('div')
        container.id = `task-${i}`
        container.classList.add('container_task')


        const placeContainer = document.createElement('div')
        placeContainer.classList.add('element')
        container.appendChild(placeContainer)


        const place = document.createElement('span')
        place.textContent = `${el.place}`
        place.addEventListener('click', () => setEdit(place.id))
        placeContainer.appendChild(place)
        place.id = `place-${i}`


        const timeContainer = document.createElement('div')
        timeContainer.classList.add('element')
        container.appendChild(timeContainer)


        const time = document.createElement('span')
        time.textContent = `${new Date(el.time).toLocaleDateString('ru-ru')}`
        timeContainer.appendChild(time)
        time.addEventListener('click', () => setEdit(time.id))
        time.id = `time-${i}`

        const priceContainer = document.createElement('div')
        container.appendChild(priceContainer)
        priceContainer.classList.add('element')


        const price = document.createElement('span')
        price.textContent = `${el.price} ₽`
        price.addEventListener('click', () => setEdit(price.id))
        priceContainer.appendChild(price)
        price.id = `price-${i}`

        const deleteEl = document.createElement('button')
        deleteEl.textContent = 'Удалить'
        deleteEl.addEventListener('click', async () => {
            if (el._id) {
                await deleteElement(el._id)
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
            openEdit(i)
        })

        // див со всеми задачами
        if (spends) {
            spends.appendChild(container)
            spends.appendChild(sum)
        }

    })
}