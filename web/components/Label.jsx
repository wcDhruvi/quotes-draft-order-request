import React from 'react';

const Label = ({name}) => {
    return (
        <div className="Polaris-Labelled__LabelWrapper">
            <div className="Polaris-Label">
                <label className="Polaris-Label__Text">
                    {name}
                </label>
            </div>
        </div>
    );
};

export default Label;
