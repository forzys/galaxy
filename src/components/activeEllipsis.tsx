



import React,{ useEffect } from 'react'
import { Tooltip } from 'antd'
import {onGetHtmlString, useUpdate } from '../common/common'

export default React.memo((props: any )=>{
    const [state, setState]  = useUpdate({})

    useEffect(()=>{
        let childrenCon = onGetHtmlString(props.children)

        console.log({ L: props.children })
        let len = childrenCon?.length || 0
        console.log({ len,childrenCon })
        setState({ len })
    },[props.children])

 

    return (
        
        <div>

             {
                 props?.maxLength ? (
                     <>
                     {
                         state?.len > props?.maxLength ? (
                            <Tooltip
                                placement={props?.placement}
                                overlayStyle={{ wordBreak: 'break-all' }}
                                
                                title={
                                    <div className="ellipsis line-x" style={{ '--line-x': 10 } as any}>
                                        {props.children}
                                    </div>
                                }
                            >
                                <div className="ellipsis line-x" 
                                    style={{ wordBreak: 'break-all', whiteSpace: 'pre-line', '--line-x': props?.line || 1, width: props?.width } as any}>
                                    {props.children}
                                </div>
                                </Tooltip>
                         ): props.children
                     }
                     </>
                 ): props?.children
             } 
        </div>
    )



})