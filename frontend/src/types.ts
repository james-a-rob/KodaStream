export type User = {
    firstName: string,
    lastName: string,
    age: number,
    id: number

}

export type FetchUserDataResponse = {
    data: User[];
}

export type PostUserResponse = {
    data: User
}
export type NewUser = Omit<User, 'id'>;
