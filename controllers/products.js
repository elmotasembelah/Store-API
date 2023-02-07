const productSchema = require("../models/product");

const getAllProductsStatic = async (req, res) => {
    const products = await productSchema
        .find({ price: { $gt: 30 } })
        .sort("-price -name");
    res.status(200).json({ products, nbhits: products.length });
};

const getAllProducts = async (req, res) => {
    const { featured, company, name, numberFilters, sort, fields } = req.query;
    console.log(req.query);
    const queryObject = {};

    if (featured) {
        queryObject.featured = featured;
    }

    if (company) {
        queryObject.company = company;
    }
    if (name) {
        queryObject.name = { $regex: name, $options: "i" };
    }
    if (numberFilters) {
        const operatorMap = {
            ">": "$gt",
            ">=": "$gte",
            "=": "$eq",
            "<": "$lt",
            "<=": "$lte",
        };
        const regEx = /\b(>|>=|=|<|<=)\b/g;
        let filters = numberFilters.replace(
            regEx,
            (match) => `-${operatorMap[match]}-`
        );
        const options = ["price", "rating"];
        filters = filters.split(",").forEach((filter) => {
            const [field, operator, value] = filter.split("-");
            if (options.includes(field))
                queryObject[field] = { [operator]: Number(value) };
        });
    }
    let result = productSchema.find(queryObject);

    if (sort) {
        const sortList = sort.split(",").join(" ");
        result = result.sort(sortList);
    } else {
        result = result.sort("createdAt");
    }

    if (fields) {
        const fieldsList = fields.split(",").join(" ");
        result = result.select(fieldsList);
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    result = result.limit(limit).skip(skip);

    const products = await result;
    res.status(200).json({ products, nbhits: products.length });
};

module.exports = {
    getAllProductsStatic,
    getAllProducts,
};
