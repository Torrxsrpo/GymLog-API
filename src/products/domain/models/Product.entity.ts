export interface ProductProps {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
}

export class Product {
    constructor(private props: ProductProps) {}

    get Id(): string {
        return this.props.id;
    }

    getName(): string {
        return this.props.name;
    }

    getDescription(): string {
        return this.props.description;
    }

    getPrice(): number {
        return this.props.price;
    }

    getStock(): number {
        return this.props.stock;
    }
}
