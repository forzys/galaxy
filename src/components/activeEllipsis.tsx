



import React,{ useEffect } from 'react'
import { Tooltip } from 'antd'
import {onGetHtmlString, useUpdate } from '../common/common'

export default React.memo((props: any )=>{
    const [state, setState]  = useUpdate({})

    useEffect(()=>{
        let childrenCon = onGetHtmlString(props.children)
 
        let len = childrenCon?.length || 0 
        setState({ len })
    },[props.children])

 

    return (
        
        <div onClick={props?.onClick}> 
            {
                props?.tips && (
                    state?.len > (props?.maxLength || 10) && (
                        <Tooltip
                            placement={props?.placement}
                            overlayStyle={{ wordBreak: 'break-all' }}
                            mouseEnterDelay={props?.delay}
                            title={
                                <div className="ellipsis line-x" style={{ '--line-x': 5 } as any}>
                                    {props.children}
                                </div>
                            }
                        >
                        <div className="ellipsis word-break line-x" style={{ '--line-x': props?.line || 1, width: props?.width } as any}>
                            {props.children}
                        </div>
                    </Tooltip>
                    )
                ) || (
                    <div className="ellipsis word-break line-x" style={{ '--line-x': props?.line || 1, width: props?.width } as any}>
                        {props.children}
                    </div>
                ) 
            }              
        </div>
    )



})