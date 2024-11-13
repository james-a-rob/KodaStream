
import apiApp from './api';
import AppDataSource from '../data-source';


const start = async () => {

    await AppDataSource.initialize();

    apiApp.listen(4000, () => {
        console.log('api listening on port 4000');
    });

}

start();
