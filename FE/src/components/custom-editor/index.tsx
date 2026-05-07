import { Editor, EditorProps } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import ReactDraftWysiwyg from "./react-draft-wysiwyg";
import { FormHelperText, InputLabel, styled, useTheme } from "@mui/material";
import { Box } from "@mui/material";
import { BoxProps } from "@mui/material";


interface TProps extends EditorProps {
    label?: string
    error?: boolean
    helperText?: string
}

interface TStyledEditorProps extends BoxProps {
    error?: boolean
}

const StyledEditor = styled(Box)<TStyledEditorProps>(({ theme, error }) => ({
    border: `1px solid ${theme.palette.customColors.borderColor}`,
    borderRadius: 8,
    ".rdw-editor-wrapper": {
        borderRadius: 8,
        backgroundColor: "transparent !important",
        border: error ? `1px solid ${theme.palette.error.main}` : `1px solid rgba(${theme.palette.customColors.main}, 0.2)`,
    },
    ".rdw-editor-toolbar": {
        border: "none",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
    },
    ".rdw-editor-main": {
        padding: "8px",
        borderTop: `1px solid rgba(${theme.palette.customColors.main}, 0.2) !important`,
        minHeight: "200px",
        maxHeight: "200px",
        overflow: "auto"
    }
}))

const CustomEditor = (props: TProps) => {
    const { editorState, onEditorStateChange, error, label, helperText, ...rests } = props
    const theme = useTheme()

    return (
        <StyledEditor>
            <InputLabel sx={{
                fontSize: "13px",
                mb: "4px",
                display: "block",
                color: error ? theme.palette.error.main : `rgba(${theme.palette.customColors.main}, 0.68)`
            }}>
                {label}
            </InputLabel>
            <ReactDraftWysiwyg
                editorState={editorState}
                onEditorStateChange={onEditorStateChange}
                {...rests}
            />
            {helperText && (
                <FormHelperText sx={{
                    color: theme.palette.error.main
                }}>
                    {helperText}
                </FormHelperText>
            )}
        </StyledEditor>
    )
}

export default CustomEditor