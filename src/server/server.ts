import {Backend, Collection, FeatureCursor, Filter, Query} from '../lib';
import * as _ from 'lodash';

/**
 * The Server contains links to backends and functions to access data (run queries)
 **/
export class Server {
    backends : Backend[] = [];

    getCollections() : Collection[] {
        let ret = [];
        _.each(this.backends, function(b) {
            ret = _.concat(ret, b.collections);
        });
        return ret;
    };

    getCollection(name : string) : Collection {
        let i : number, o : number;
        let b : Backend;
        let c : Collection;

        for (i = 0; i < this.backends.length; i++) {
            b = this.backends[i];
            for (o = 0; o < b.collections.length; o++) {
                c = b.collections[o];
                if (c.name === name) {
                    return c;
                }
            }
        }
    };

    executeQuery(query : Query) : FeatureCursor {
        let collection = this.getCollection(query.featureName);

        let cursor = collection.executeQuery(query);

        function getNextFiltered() {
            let ret = null;
            do {
                // Original cursor is empty => return
                if (!cursor.hasNext()) return null;

                // Get next feature
                ret = cursor.next();

                // Test with filters, if not accepted => null
                if (_.find(cursor.remainingFilter, function(filter) { return !filter.accept(ret); })) {
                    ret = null;
                }

            } while(ret === null || ret === undefined);

            return ret;
        }

        let nextFeature = getNextFiltered();

        return {
            hasNext: () => (nextFeature !== null && nextFeature !== undefined),
            next: () => {
                let ret = nextFeature;
                nextFeature = getNextFiltered();
                return ret;
            },
            remainingFilter: []
        };
    };
};

