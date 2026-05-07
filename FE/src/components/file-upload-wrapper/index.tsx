import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface TProp {
    children: React.ReactNode,
    uploadFile: (file: File) => void,
    objectAcceptedFile?: Record<string, string[]>
}

const FileUploadWrapper = (props: TProp) => {
    const { children, uploadFile, objectAcceptedFile } = props
    const { getRootProps, getInputProps } = useDropzone({
        accept: objectAcceptedFile ? objectAcceptedFile : {},
        onDrop: acceptedFiles => {
            uploadFile(acceptedFiles[0])
        }
    })

    return (
        <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            {children}
        </div>
    )
} 

export default FileUploadWrapper