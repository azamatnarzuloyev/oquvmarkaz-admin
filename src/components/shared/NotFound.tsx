import FileNotFound from '@/assets/svg/FileNotFound'

const NotFound = ({ message }: { message: string }) => {
    return (
        <div className="w-full flex justify-center">
            <div className="block w-52">
                <span className="mx-auto flex justify-center w-full ">
                    <FileNotFound />
                </span>
                <span className="font-semibold text-center block">
                    {message}
                </span>
            </div>
        </div>
    )
}

export default NotFound
