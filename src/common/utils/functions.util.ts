export const createSlug = (str: string)=>{
    return str.toLowerCase().replace(/[ًٌٍ،؛,َُِّـأ\.\+\-`~!@#$%^&*(){}_=;:"',?؟<>»«]+/g,"")?.replace(/[\s]+/g,"-")
}

export const randomString = () => {
    return Math.random().toString(36).substring(2)
}