import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {withApi} from '../withapi';
import FilterSelect from './filterselect';
import {FilterOutput} from './filteroutput';

/* Lifecycle based components */

class Filter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isLoadingProducts: true,
            brands: [],
            currentCollection: 0,
            types: [],
            categories: [],
            collections: [],
            products: [],
            productsFiltered: [],
            filters: {
                brand: [],
                category: [],
                type: [],
                collection: [],
            },
            filtersEnabled: {
                brand: [],
                category: [],
                type: [],
                collection: [],
            }
        };
    }

    // Mounted
    componentDidMount() {

        let listClass = document.body.classList;

        let split = '';

        for (let i = 0; i < listClass.length; i++) {
            if (listClass[i].includes('term-')) {
                split = listClass[i].split(/term-/);

                if (!isNaN(+split[1])) {
                    this.setState({
                        currentCollection: split[1],
                        filters: {
                            category: [],
                            type: [],
                            brand: [],
                            collection: [],
                        }
                    });
                }
            }
        }

        const brandRequest = this.props.api('product_brands', 'get');
        const typeRequest = this.props.api('product_types', 'get');
        const categoryRequest = this.props.api('product_categories', 'get');

        wcApi.get('products/categories?per_page=100&hide_empty=true&orderby=name&parent=' + split[1], (error, data, resp) => {
            const collections = JSON.parse(resp);

            // Resolve promises
            Promise.all([brandRequest, typeRequest, categoryRequest, collections]).then((values) => {
                this.setState({
                    isLoading: false,
                    brands: values[0],
                    types: values[1],
                    categories: values[2],
                    collections: values[3]
                }, () => {
                    // Fetch products
                    this.handleLoadProducts();

                });
            });
        });
    }

    // Collection fetcher
    handleLoadProducts() {

        const {
            currentCollection
        } = this.state;

        wcApi.get('products?per_page=100&orderby=title&category=' + currentCollection, (error, data, resp) => {
            let response = JSON.parse(resp);

            this.setState({
                isLoadingProducts: false,
                products: response,
                productsFiltered: response
            }, () => {
                // Set filter state
                this.handleFiltersState(response);
            });
        });
    }

    // Selection handler
    handleSelection(selections) {

        let {filters, products} = this.state;

        // Set filter selection
        filters[Object.keys(selections)] = selections[Object.keys(selections)].map((selection) => {
            return selection;
        });

        // Create a filtered products array
        const productsFiltered = products.filter((product) => {

            // Collection has the type filter
            let hasBrand = (filters.brand.length == 0)
                ? true
                : product['terms']['product_brands'].some(brand => filters.brand.includes(brand.term_id));

            // Collection has the type filter
            let hasType = (filters.type.length == 0)
                ? true
                : product['terms']['product_types'].some(type => filters.type.includes(type.term_id));

            // Collection has the category filter
            let hasCategory = (filters.category.length == 0)
                ? true
                : product['terms']['product_categories'].some(category => filters.category.includes(category.term_id));

            // Collection has the category filter
            let hasCollections = (filters.collection.length == 0)
                ? true
                : product['terms']['product_cat'].some(collection => filters.collection.includes(collection.term_id));

            // Conditional
            return hasCategory && hasType && hasBrand && hasCollections;
        });

        // Adjust the state based on the filtered products and selected filters
        this.setState({
            filters,
            productsFiltered
        }, () => {
            // Set filter state
            this.handleFiltersState(productsFiltered);
        });
    }

    // Reset handler
    handleReset() {
        // Shorthand
        const productsFiltered = this.state.products;

        // Adjust the state based on the filtered products and selected filters
        this.setState({
            filters: {
                brand: [],
                category: [],
                type: [],
                collection: [],
            },
            productsFiltered
        }, () => {
            // Set filter state
            this.handleFiltersState(productsFiltered);
        });
    }


    // Reset type handler
    handleResetType(type) {
        // Adjust the state based on a removed type
        let {filters} = this.state;
        filters[type] = [];

        this.setState({
            filters,
        }, () => {
            // Set filter state
            this.handleSelection({[type]: []});
        });
    }

    // Flters state handler
    handleFiltersState(products) {

        // Holder
        const filtersEnabled = {
            brand: [],
            type: [],
            category: [],
            collection: [],
        };

        // Iterate and populate
        products.forEach((product) => {

            // Find type key and adjust count or add to array
            product['terms']['product_brands'].some(brand => {
                const brandIndex = filtersEnabled.brand.findIndex(filtersEnabledBrand => {
                    return filtersEnabledBrand.id == brand.term_id;
                });

                // Adjust the count
                if (brandIndex > -1) {
                    filtersEnabled.brand[brandIndex].count++;
                } else {
                    filtersEnabled.brand.push({id: brand.term_id, count: 1});
                }
            });

            // Find type key and adjust count or add to array
            product['terms']['product_types'].some(type => {
                const typeIndex = filtersEnabled.type.findIndex(filtersEnabledType => {
                    return filtersEnabledType.id == type.term_id;
                });

                // Adjust the count
                if (typeIndex > -1) {
                    filtersEnabled.type[typeIndex].count++;
                } else {
                    filtersEnabled.type.push({id: type.term_id, count: 1});
                }
            });

            // Find category key and adjust count or add to array
            product['terms']['product_categories'].some(category => {
                const categoryIndex = filtersEnabled.category.findIndex(filtersEnabledCategory => {
                    return filtersEnabledCategory.id == category.term_id;
                });

                // Adjust the count
                if (categoryIndex > -1) {
                    filtersEnabled.category[categoryIndex].count++;
                } else {
                    filtersEnabled.category.push({id: category.term_id, count: 1});
                }
            });

            // Find category key and adjust count or add to array
            product['terms']['product_cat'].some(collection => {
                const collectionsIndex = filtersEnabled.collection.findIndex(filtersEnabledCollections => {
                    return filtersEnabledCollections.id == collection.term_id;
                });

                // Adjust the count
                if (collectionsIndex > -1) {
                    filtersEnabled.collection[collectionsIndex].count++;
                } else {
                    filtersEnabled.collection.push({id: collection.term_id, count: 1});
                }
            });

        });

        if (products.length > 0) {
            return this.setState({
                filtersEnabled,
            });
        }

        return false;
    }

    render() {

        const {
            brands,
            types,
            categories,
            collections,
            products,
            productsFiltered,
            isLoading,
            isLoadingProducts,
            filters,
            filtersEnabled
        } = this.state;

        if (isLoading) {
            return <div>Loading...</div>;
        }

        return <React.Fragment>
            <div className="grid-container">
                <FlexContainer>
                    {
                        [
                            {
                                type: 'brand',
                                filters: brands
                            },
                            {
                                type: 'type',
                                filters: types
                            },
                            {
                                type: 'category',
                                filters: categories
                            },
                            {
                                type: 'collection',
                                filters: collections
                            }
                        ].map((select, index) => {
                            // Props4
                            const props = {
                                type: select.type,
                                filters: select.filters,
                                enabled: filtersEnabled[select.type],
                                selected: filters[select.type],
                                setSelection: (selection) => this.handleSelection(selection),
                                resetType: (type) => this.handleResetType(type),
                            };
                            return <FlexColumn key={index}>
                                <FilterSelect {...props}/>
                            </FlexColumn>
                        })
                    }
                    <FlexColumn>
                        <button className="btn btn--tertiary clear" onClick={(e) => this.handleReset()}>Reset</button>
                    </FlexColumn>
                </FlexContainer>
                <ProductContainer>
                    <FilterOutput products={productsFiltered} isLoading={isLoadingProducts}/>
                </ProductContainer>
            </div>
        </React.Fragment>;
    }
}

// Container function
const ProductContainer = ({children}) => <ul className='grid-row products'>
    {children}
</ul>

// Container function
const FlexContainer = ({children}) => <div className='grid-row filter__container'>
    {children}
</div>

// Column function
const FlexColumn = ({children, flex}) => <div className='sm-3-cl flex filter__column h100'>
    {children}
</div>


export default withApi(Filter);
