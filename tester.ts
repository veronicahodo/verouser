import VeroCrud from "./verocrud";
import VeroUser from "./verouser";

let crud: VeroCrud = new VeroCrud("veronica", "chaos1201", "god", "10.0.0.104");
let user: VeroUser = new VeroUser(crud);

user.read([["userId", "=", "1"]]);

console.log(user);
