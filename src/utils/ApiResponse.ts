export default class ApiResponse {
    success: boolean;

    constructor(
        private status: number,
        private message: string,
        private data: null | object = null,
        private errors?: [Record<string, string>]
    ) {
        this.success = status < 400;
        this.data = data;
        this.message = message;
        this.errors = errors;
    }
}
