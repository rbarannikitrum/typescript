"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
////////////////////
////////////////////
////////////////////
class BaseClass {
    constructor() {
        this.total = 0;
        this.spendArr = [];
        this.spends = document.querySelector('#all_spends');
        this.serverError = 'Ошибка в получении данных с сервера';
        this.userError = 'Введите корректные данные';
        this.headers = { "Content-Type": "application/json;charset=utf-8", "Access-Control-Allow-Origin": "*" };
    }
}
class FetchMethods extends BaseClass {
    constructor() {
        super();
    }
    static get() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetch('http://localhost:8000/allSpends', {
                method: 'GET'
            }).then(res => res.json());
        });
    }
    static add(where, howMany) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetch('http://localhost:8000/create', {
                method: 'POST',
                body: JSON.stringify({ place: where, price: howMany }),
                headers
            }).then(res => res.json()).then(res => res.data);
        });
    }
    static patch(i) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetch('http://localhost:8000/update', {
                method: 'PATCH',
                body: JSON.stringify({
                    _id: spendArr[i]._id,
                    place: spendArr[i].place,
                    time: spendArr[i].time,
                    price: spendArr[i].price,
                    permanentTime: spendArr[i].permanentTime
                }),
                headers
            }).then(res => res.json());
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`http://localhost:8000/delete?_id=${id}`, { method: 'DELETE' });
            return response.status === 200;
        });
    }
}
////////////////////
////////////////////
////////////////////
let total = 0;
let spendArr = [];
const spends = document.querySelector('#all_spends');
const serverError = 'Ошибка в получении данных с сервера';
const userError = 'Введите корректные данные';
const headers = { "Content-Type": "application/json;charset=utf-8", "Access-Control-Allow-Origin": "*" };
function getReq() {
    return __awaiter(this, void 0, void 0, function* () {
        return spendArr = yield fetch('http://localhost:8000/allSpends', {
            method: 'GET'
        }).then(res => res.json());
    });
}
function createReq(where, howMany) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch('http://localhost:8000/create', {
            method: 'POST',
            body: JSON.stringify({ place: where, price: howMany }),
            headers
        }).then(res => res.json()).then(res => res.data);
    });
}
function patchReq(i) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch('http://localhost:8000/update', {
            method: 'PATCH',
            body: JSON.stringify({
                _id: spendArr[i]._id,
                place: spendArr[i].place,
                time: spendArr[i].time,
                price: spendArr[i].price,
                permanentTime: spendArr[i].permanentTime
            }),
            headers
        }).then(res => res.json());
    });
}
function deleteReq(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`http://localhost:8000/delete?_id=${id}`, { method: 'DELETE' });
        return response.status === 200;
    });
}
// получение задачек
function fetchData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            setLoader();
            spendArr = yield FetchMethods.get();
            render();
        }
        catch (error) {
            setError(serverError);
        }
        finally {
            deleteLoader();
        }
    });
}
// добавить задачу
function addSpend() {
    return __awaiter(this, void 0, void 0, function* () {
        let howMany = Number(document.querySelector('#howMany').value);
        howMany = Number(howMany.toFixed(2));
        let where = document.querySelector('#where').value.trim();
        if (!where || !howMany || howMany > 9999999 || howMany <= 0) {
            return setError(userError);
        }
        try {
            yield FetchMethods.add(where, howMany);
            spendArr = yield FetchMethods.get();
            render();
        }
        catch (error) {
            setError(serverError);
        }
        document.querySelector('#where').value = '';
        document.querySelector('#howMany').value = '';
    });
}
// добавление задачи на enter
function setEnter(event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (event.keyCode === 13) {
            event.preventDefault();
            yield addSpend();
        }
    });
}
document.addEventListener('keyup', setEnter);
// сохранить изменения в случае когда открывается 3 инпута
function saveChangesForAll(i) {
    return __awaiter(this, void 0, void 0, function* () {
        let editPriceInput = Number(document.querySelector(`#edit_price_input-${i}`).value);
        let editWhereInput = document.querySelector(`#edit_place_input-${i}`).value.trim();
        editPriceInput = Number(Number(editPriceInput).toFixed(2));
        let editTimeInput = document.querySelector(`#edit_time_input-${i}`).value;
        const time = new Date(editTimeInput);
        const permTime = new Date(spendArr[i].permanentTime);
        if (editPriceInput <= 0 ||
            editPriceInput > 9999999 ||
            editWhereInput === '' ||
            Math.abs(time.getTime() - permTime.getTime()) / (60 * 60 * 24 * 1000) > 7) {
            return setError(userError);
        }
        if (editWhereInput || editPriceInput) {
            try {
                const checkVar = spendArr[i];
                if (checkVar) {
                    checkVar.place = editWhereInput;
                    checkVar.time = editTimeInput;
                    checkVar.price = editPriceInput;
                }
                yield FetchMethods.patch(i);
                spendArr = yield FetchMethods.get();
                render();
            }
            catch (error) {
                setError(serverError);
            }
        }
        else
            render();
    });
}
// получить инпут когда открыто одно поле ввода
function getInput(elem) {
    let editInput = document.querySelector(`#edit-${elem}`).value;
    if (elem.split('-')[0] === 'price') {
        editInput = Number(editInput).toFixed(2);
    }
    if (Number(editInput) <= 0) {
        setError(userError);
    }
    return editInput;
}
// сохранить изменения когда открыто одно поле ввода
function saveChanges(elem) {
    return __awaiter(this, void 0, void 0, function* () {
        const i = Number(elem.split('-')[1]);
        const type = String(elem.split('-')[0]);
        const editInput = getInput(elem);
        if (Number(editInput) === 0 || Number(editInput) > 9999999) {
            return setError(userError);
        }
        if (type && Math.abs(new Date(editInput).getTime() - new Date(spendArr[i].permanentTime).getTime()) / (60 * 60 * 24 * 1000) > 7) {
            return setError(userError);
        }
        const element = spendArr[i];
        if (element) {
            if (type === 'place') {
                element.place = editInput;
            }
            if (type === 'time') {
                element.time = editInput;
            }
            if (type === 'price') {
                element.price = Number(editInput);
            }
        }
        try {
            yield FetchMethods.patch(i);
            spendArr = yield FetchMethods.get();
            render();
        }
        catch (error) {
            setError(serverError);
        }
    });
}
// удалить задачу
function deleteElement(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield FetchMethods.delete(id);
            spendArr = yield FetchMethods.get();
            render();
        }
        catch (error) {
            setError(serverError);
        }
    });
}
// открыть окно редактирования с одним полем ввода
function setEdit(elem) {
    const inputType = elem.split('-')[0];
    let i = Number(elem.split('-')[1]);
    document.removeEventListener('keyup', setEnter);
    render();
    let field = document.querySelector(`#${elem}`);
    const task = field.parentNode;
    task.className = 'task';
    field.remove();
    const temp = spendArr[i];
    const input = document.createElement('input');
    if (inputType === 'price') {
        input.type = 'number';
        if (temp) {
            input.value = String(temp.price);
        }
    }
    else if (inputType === 'time') {
        input.type = 'date';
        if (temp) {
            input.valueAsDate = new Date(temp.time);
        }
    }
    else {
        input.type = 'text';
        if (temp) {
            input.value = temp.place;
        }
    }
    input.classList.add('input_edit');
    input.id = `edit-${inputType}-${i}`;
    task.appendChild(input);
    task.addEventListener('focusout', () => render());
    input.addEventListener('keyup', (event) => __awaiter(this, void 0, void 0, function* () {
        if (event.keyCode === 13) {
            event.preventDefault();
            yield saveChanges(elem);
        }
    }));
}
// открыть окно редактирования с 3 полями ввода
function openEdit(i) {
    render();
    const task = document.querySelector(`#task-${i}`) || null;
    if (task) {
        task.innerHTML = '';
    }
    const editPlaceInput = document.createElement('input');
    editPlaceInput.placeholder = 'Где';
    editPlaceInput.maxLength = 300;
    editPlaceInput.id = `edit_place_input-${i}`;
    const temp = spendArr[i];
    if (temp) {
        editPlaceInput.value = temp.place;
    }
    editPlaceInput.classList.add('input_edit');
    if (task) {
        task.appendChild(editPlaceInput);
    }
    const editTimeInput = document.createElement('input');
    editTimeInput.id = `edit_time_input-${i}`;
    editTimeInput.type = 'date';
    if (temp) {
        editTimeInput.valueAsDate = new Date(temp.time);
    }
    editTimeInput.classList.add('input_edit');
    if (task) {
        task.appendChild(editTimeInput);
    }
    const editPriceInput = document.createElement('input');
    editPriceInput.placeholder = 'Потрачено';
    editPriceInput.id = `edit_price_input-${i}`;
    editPriceInput.type = 'number';
    editPriceInput.classList.add('input_edit');
    if (temp) {
        editPriceInput.value = String(temp.price);
    }
    if (task) {
        task.appendChild(editPriceInput);
    }
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Сохранить';
    saveButton.classList.add('btn');
    saveButton.addEventListener('click', () => saveChangesForAll(i));
    if (task) {
        task.appendChild(saveButton);
    }
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Отмена';
    cancelButton.classList.add('btn');
    cancelButton.addEventListener('click', () => render());
    if (task) {
        task.appendChild(cancelButton);
    }
}
// создал лоадер
function setLoader() {
    const ring = document.createElement('div');
    ring.id = 'ring';
    ring.classList.add('lds-ring');
    spends.before(ring);
    let firstDiv = document.createElement('div');
    ring.appendChild(firstDiv);
    let secondDiv = document.createElement('div');
    ring.appendChild(secondDiv);
    let thirdDiv = document.createElement('div');
    ring.appendChild(thirdDiv);
    let fourthDiv = document.createElement('div');
    ring.appendChild(fourthDiv);
}
// удалил лоадер
function deleteLoader() {
    const ring = document.getElementById('ring') || null;
    if (ring) {
        ring.remove();
    }
}
function setError(error) {
    if (!document.querySelector('.error')) {
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('error');
        const errorText = document.createElement('span');
        errorText.textContent = error;
        errorDiv.appendChild(errorText);
        spends.prepend(errorDiv);
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}
// подсчет общей суммы
function reduceTotal() {
    total = spendArr.reduce((accum, el) => accum + el.price, 0);
}
// проверка на отсутствие задач
function checkEmpty() {
    if (spendArr.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('empty');
        const emptyText = document.createElement('span');
        emptyText.textContent = 'Список трат пуст';
        emptyDiv.appendChild(emptyText);
        spends.appendChild(emptyDiv);
    }
}
// рендер
function render() {
    spends.innerHTML = '';
    const sum = document.createElement('div');
    sum.classList.add('sum');
    reduceTotal();
    sum.textContent = `Всего денег потрачено было : ${total} рублей`;
    checkEmpty();
    spendArr.forEach((el, i) => {
        // вся задача
        const container = document.createElement('div');
        container.id = `task-${i}`;
        container.classList.add('container_task');
        const placeContainer = document.createElement('div');
        placeContainer.classList.add('element');
        container.appendChild(placeContainer);
        const place = document.createElement('span');
        place.textContent = `${el.place}`;
        place.addEventListener('click', () => setEdit(place.id));
        placeContainer.appendChild(place);
        place.id = `place-${i}`;
        const timeContainer = document.createElement('div');
        timeContainer.classList.add('element');
        container.appendChild(timeContainer);
        const time = document.createElement('span');
        time.textContent = `${new Date(el.time).toLocaleDateString('ru-ru')}`;
        timeContainer.appendChild(time);
        time.addEventListener('click', () => setEdit(time.id));
        time.id = `time-${i}`;
        const priceContainer = document.createElement('div');
        container.appendChild(priceContainer);
        priceContainer.classList.add('element');
        const price = document.createElement('span');
        price.textContent = `${el.price} ₽`;
        price.addEventListener('click', () => setEdit(price.id));
        priceContainer.appendChild(price);
        price.id = `price-${i}`;
        const deleteEl = document.createElement('button');
        deleteEl.textContent = 'Удалить';
        deleteEl.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            if (el._id) {
                yield deleteElement(el._id);
            }
        }));
        container.appendChild(deleteEl);
        deleteEl.classList.add('btn');
        deleteEl.id = `delete-${i}`;
        const editTask = document.createElement('button');
        editTask.textContent = 'Изменить';
        container.appendChild(editTask);
        editTask.classList.add('btn');
        editTask.classList.add('edit_btn');
        editTask.id = `edit-${i}`;
        editTask.addEventListener('click', (event) => {
            event.stopPropagation();
            openEdit(i);
        });
        // див со всеми задачами
        spends.appendChild(container);
        spends.appendChild(sum);
    });
}
