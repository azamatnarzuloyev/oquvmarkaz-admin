const LabelCustom = ({ className, htmlFor, text, edit }: any) => {
    return (
        <label
            htmlFor={htmlFor}
            className={`${className} flex gap-2 items-center  text-slate-100 w-full text-[14px] font-[600] `}
        >
            {text}
            <span className="text-slate-400">*</span>
            {edit && (
                <span className="text-heading2 cursor-pointer">{edit}</span>
            )}
        </label>
    )
}

export default LabelCustom
