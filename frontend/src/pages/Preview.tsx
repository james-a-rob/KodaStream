import React from 'react';
import { useParams } from 'react-router-dom';
import Video from '../components/Video';

const Preview: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    return (
        <Video id={id} />
    );
};

export default Preview;
