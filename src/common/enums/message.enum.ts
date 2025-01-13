export enum BadRequestMessage{
    InValidLoginDto = "اطلاعات ورود صحیح نمی‌باشد",
    InValidRegisterDto = "اطلاعات ثبت‌نام صحیح نمی‌باشد",
    SomthinError = "خطایی پیش آمده است",
    InvalidCategory = "دسته‌بندی را درست وارد نمایید",
    AlreadyAccepted = "نظر انتخاب شده قبلا تایید شده است",
    AlreadyRejected = "نظر انتخاب شده قبلا رد شده است",
}

export enum AuthMessage{
    NotFoundAccount = "حساب کاربری یافت نشد",
    AlreadyExistAccount = "حساب کاربری وجود دارد",
    ExpiredCode = "کد تایید منثضی شده است، لطفا مجددا تلاش بفرمایید",
    LoginAgain = "لطفا مجددا وارد حساب کاربری خود شوید",
    TryAgain = "لطفا مجددا تلاش بفرمایید",
    IncorrectCode = "کد تایید نادرست است، لطفا مجددا تلاش بفرمایید",
    Blocked = "حساب کاربری شما مسدود است"
}
export enum PublicMessage{
    SendOtp = "کد اعتبارسنجی ارسال شد",
    LoggedIn = "با موفقیت وارد شدید",
    Created = "با موفقیت ایجاد شد",
    NotFound = "موردی یافت نشد",
    Updated = "با موفقیت بروزرسانی شد",
    Deleted = "با موفقیت حذف شد",
    Done = "با موفقیت انجام شد",
    Follow="کاربر مورد نظر دنبال شد",
    UnFollow = "کاربر مورد نظر از لیست دنبال شوندگان حذف شد",
    Blocked = "کاربر مورد نظر مسدود شد",
    UnBlocked = "کاربر مورد نظر از مسدود خارج شد"
}
export enum ConflictMessage{
    CategoryTitle = "عنوان دسته‌بندی قبلا ثبت شده است",
    Email = "ایمیل وارد شده قبلا ثبت نام کرده است",
    Phone = "موبایل وارد شده قبلا ثبت نام کرده است",
}
export enum ValidationMessage{
    InValidImageFormat = "فرمت عکس نادرست است",
    InValidEmailFormat = "فرمت ایمیل نادرست است",
    InValidPhoneFormat = "فرمت موبایل نادرست است",
}
