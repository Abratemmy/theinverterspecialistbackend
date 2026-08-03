class BaseService {

    constructor(model) {
        this.model = model;
    }

    async create(data) {
        return await this.model.create(data);
    }

    async findAll(options = {}) {
        return await this.model.findAll(options);
    }

    async findById(id, options = {}) {
        return await this.model.findByPk(id, options);
    }

    async update(id, data) {

        const item = await this.model.findByPk(id);

        if (!item) {
            throw new Error("Record not found.");
        }

        await item.update(data);

        return item;
    }

    async delete(id) {

        const item = await this.model.findByPk(id);

        if (!item) {
            throw new Error("Record not found.");
        }

        await item.destroy();

        return true;
    }

}

module.exports = BaseService;