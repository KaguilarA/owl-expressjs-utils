import { OwlModel, OwlSession, OwlIsAuth, OwlRateLimit, OwlCors, OwlTransaction, OwlTypes, OwlMongoCommand } from "owl-expressjs-utils";
import type { ModelReturn, QueryOptions } from "owl-expressjs-utils";
export function verifyPublicDeclarations(): ModelReturn<{ name: string }> {
 const model = OwlModel<{ name: string }>("ConsumerProbe", { name: { type: String, required: true } });
 const options: QueryOptions = { select: "name", lean: true, limit: 10 };
 const read: Promise<{ name: string }[]> = model.getByCoincidence({}, options);
 read.then(rows => rows.map(row => row.name.toUpperCase()));
 [OwlSession, OwlIsAuth, OwlRateLimit, OwlCors, OwlTransaction, OwlTypes, OwlMongoCommand].forEach(value => { if (!value) throw new Error("Missing public export"); });
 return model;
}
