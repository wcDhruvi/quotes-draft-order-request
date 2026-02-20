import React, {useEffect, useRef, useState} from 'react';
import { SketchPicker } from 'react-color'

const ColorInput = ({name, value, onChange,positon="" }) => {
    const [clickedOutside, setClickedOutside] = useState(false);
    const myRef = useRef();

    const handleClickOutside = (e) => {
        if (!myRef.current.contains(e.target)) {
            setClickedOutside(false);
        }
    };

    const handleClickInside = () => setClickedOutside(true);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    });

    return (

        <div style={{ display: "flex", flexDirection: "column" }}>

            <div
                className={`color_picker ${positon}`}
                onClick={handleClickInside}
                ref={myRef}
            >
                <div style={{ background: value }} className="color_picker_color"></div>
                <span id={name}>{value}</span>
                {clickedOutside && (
                    <SketchPicker
                        presetColors={[]}
                        color={value ? value : "#000000"}
                        onChange={(color) => onChange(name, color.hex) }
                    />
                )}
            </div>
        </div>




    );
};

export default ColorInput;
