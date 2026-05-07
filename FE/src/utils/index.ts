import { ContentState, EditorState } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import { TItemOrderProduct } from "src/types/order";

export const toFullName = (lastName: string, middleName: string, firstName: string, language: string) => {
    if (language === 'vi') {
        return `${lastName ? lastName : ''} ${middleName ? middleName : ''} ${firstName ? firstName : ''}`.trim()
    }
    return `${firstName ? firstName : ''} ${middleName ? middleName : ''} ${lastName ? lastName : ''}`.trim()
}

export const convertBase64 = (file: File): Promise<string> =>{
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (error) => reject(error)
    })
}


export const separationFullname = (fullName: string, language: string) => {
    const result = {
        firstName: "",
        middleName: "",
        lastName: "",
    }
    const arrFullName = fullName.trim().split(" ")?.filter(Boolean)
    if (arrFullName?.length === 1) {
        if (language === 'vi') {
            result.firstName = arrFullName.join()
        }
        else if (language === 'en') {
            result.lastName = arrFullName.join()
        }
    }
    else if (arrFullName?.length === 2) {
        if (language === 'vi') {
            result.lastName = arrFullName[0]
            result.firstName = arrFullName[1]
        }
        else if (language === 'en') {
            result.firstName = arrFullName[0]
            result.lastName = arrFullName[1]
        }
    }
    else if (arrFullName?.length >= 3) {
        if (language === 'vi') {
            result.lastName = arrFullName[0]
            result.middleName = arrFullName.slice(1, arrFullName.length - 1).join(" ")
            result.firstName = arrFullName[arrFullName.length - 1]
        }
        else if (language === 'en') {
            result.lastName = arrFullName[arrFullName.length - 1]
            result.middleName = arrFullName.slice(1, arrFullName.length - 1).join(" ")
            result.firstName = arrFullName[0]
        }
    }
    return result
}

export const getAllValuesOfObject = (obj: any, arrExclude?: string[]) => {
    try {
        const value: any[] = []
        for (const key in obj) {
            if (typeof obj[key] === 'object') {
                value.push(...getAllValuesOfObject(obj[key], arrExclude))
            }
            else {
                if (!arrExclude?.includes(obj[key])) {
                    value.push(obj[key])
                }
            }
        }
        return value
    } catch (error) {
        return []
    }
}

export const formatDate = (value: Date | string, format: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) => {
    if (!value) {
        return value
    }
    // return new Date(value).toLocaleDateString('vi-VN')
    return new Intl.DateTimeFormat('vi-VN', format).format(new Date(value))
}

export const formatFilter = (filter: Record<string, string[] | string>) => {
    const result: Record<string, string> = {}

    Object.keys(filter).forEach((key) => {
        const value = filter[key]
        if (Array.isArray(value) && value.length > 0) {
            result[key] = value.join('|')
        } else if (typeof value === 'string') {
            result[key] = value
        }
    })

    return result
}


export const stringToSlug = (str: string) => {
    // remove accents
    const from = "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ",
        to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";
    for (let i = 0, l = from.length; i < l; i++) {
        str = str.replace(RegExp(from[i], "gi"), to[i]);
    }

    str = str.toLowerCase()
        .trim()
        .replace(/[^a-z0-9\-]/g, '-')
        .replace(/-+/g, '-');

    return str;
}

export const convertHTMLToDraft = (html: string) => {

    const blocksFromHTML = htmlToDraft(html);
    const { contentBlocks, entityMap } = blocksFromHTML

    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    const editorState = EditorState.createWithContent(contentState);

    return editorState
}

export const formatPrice = (value: number | string) => {
    try {
        return Number(value).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    } catch (error) {
        return value
    }
}

export const cloneDeep = (data: any) => {
    try {
        return JSON.parse(JSON.stringify(data))
    } catch (error) {
        return data
    }
}

export const convertUpdateProductToCart = (orderItems: TItemOrderProduct[], addItem: TItemOrderProduct) => {
    try {
        let result = []
        const cloneOrderItems = cloneDeep(orderItems)
        const findItems = cloneOrderItems.find((item: TItemOrderProduct) => item.productId === addItem.productId)
        if (findItems) {
            findItems.amount += addItem.quantity
        } else {
            cloneOrderItems.push(addItem)
        }
        result = cloneOrderItems.filter((item: TItemOrderProduct) => item.quantity)
        return result
    } catch (error) {
        return orderItems
    }
}

export const convertUpdateMultipleProductsCard = (orderItems: TItemOrderProduct[], addItems: TItemOrderProduct[]) => {
    try {
        let result = []
        const cloneOrderItems = cloneDeep(orderItems)
        addItems.forEach((addItem)=>{
            const findItems = cloneOrderItems.find((item: TItemOrderProduct) => item.productId === addItem.productId)
            if (findItems) {
                findItems.quantity += addItem.quantity
            } else {
                cloneOrderItems.push(addItem)
            }
        })
        result = cloneOrderItems.filter((item: TItemOrderProduct) => item.quantity)
        return result
    } catch (error) {
        return orderItems
    }
}

export const isExpired = (startDate: Date | null, endDate: Date | null) => {
    if (startDate && endDate) {
        const currentTime = new Date().getTime()
        const startDateTime = new Date(startDate).getTime()
        const endDateTime = new Date(endDate).getTime()

        return startDateTime <= currentTime && currentTime <= endDateTime
    }
    return false
}