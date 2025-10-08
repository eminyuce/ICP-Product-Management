import OrderedMap "mo:base/OrderedMap";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Registry "blob-storage/registry";

actor ProductManager {
  transient let natMap = OrderedMap.Make<Nat>(Nat.compare);
  transient let textMap = OrderedMap.Make<Text>(Text.compare);

  var products : OrderedMap.Map<Nat, Product> = natMap.empty<Product>();
  var skuIndex : OrderedMap.Map<Text, Nat> = textMap.empty<Nat>();
  var nextId : Nat = 1;

  let registry = Registry.new();

  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    quantity : Int;
    category : Text;
    sku : Text;
    status : Nat;
    ordering : Int;
    imagePath : ?Text;
    created_at : Int;
    updated_at : Int;
  };

  public type ProductInput = {
    name : Text;
    description : Text;
    price : Float;
    quantity : Int;
    category : Text;
    sku : Text;
    status : Nat;
    ordering : Int;
    imagePath : ?Text;
  };

  public type ProductPage = {
    products : [Product];
    totalCount : Nat;
    currentPage : Nat;
    totalPages : Nat;
    hasNextPage : Bool;
    hasPreviousPage : Bool;
  };

  public type BatchDeleteResult = {
    deletedCount : Nat;
    requestedCount : Nat;
  };

  public type ProductUpdateFields = {
    price : ?Float;
    quantity : ?Int;
    status : ?Nat;
    ordering : ?Int;
  };

  public func createProduct(input : ProductInput) : async Product {
    if (Text.size(input.name) == 0) {
      Debug.trap("Product name is required");
    };

    if (Float.equal(input.price, 0.0)) {
      Debug.trap("Product price is required");
    };

    if (textMap.contains(skuIndex, input.sku)) {
      Debug.trap("SKU must be unique");
    };

    let now = Time.now();
    let id = nextId;
    nextId += 1;

    let product : Product = {
      id;
      name = input.name;
      description = input.description;
      price = input.price;
      quantity = input.quantity;
      category = input.category;
      sku = input.sku;
      status = input.status;
      ordering = input.ordering;
      imagePath = input.imagePath;
      created_at = now;
      updated_at = now;
    };

    products := natMap.put(products, id, product);
    skuIndex := textMap.put(skuIndex, input.sku, id);

    product;
  };

  public query func getProduct(id : Nat) : async ?Product {
    natMap.get(products, id);
  };

  public query func getAllProducts(
    page : Nat,
    limit : Nat,
    nameFilter : Text,
    categoryFilter : Text,
    skuFilter : Text,
    statusFilter : Nat,
    orderingFilter : Int,
    sortBy : Text,
    sortOrder : Text,
    search : Text,
    createdFrom : ?Int,
    createdTo : ?Int,
    updatedFrom : ?Int,
    updatedTo : ?Int,
  ) : async ProductPage {
    let allProducts = Iter.toArray(natMap.vals(products));

    let filtered = Array.filter<Product>(
      allProducts,
      func(p : Product) : Bool {
        let nameMatch = Text.contains(Text.toLowercase(p.name), #text(Text.toLowercase(nameFilter)));
        let categoryMatch = Text.contains(Text.toLowercase(p.category), #text(Text.toLowercase(categoryFilter)));
        let skuMatch = Text.contains(Text.toLowercase(p.sku), #text(Text.toLowercase(skuFilter)));
        let statusMatch = if (statusFilter == 0) { true } else { p.status == statusFilter };
        let orderingMatch = if (orderingFilter == 0) { true } else { p.ordering == orderingFilter };

        let createdDateMatch = switch (createdFrom, createdTo) {
          case (null, null) { true };
          case (?from, null) { p.created_at >= from };
          case (null, ?to) { p.created_at <= to };
          case (?from, ?to) { p.created_at >= from and p.created_at <= to };
        };

        let updatedDateMatch = switch (updatedFrom, updatedTo) {
          case (null, null) { true };
          case (?from, null) { p.updated_at >= from };
          case (null, ?to) { p.updated_at <= to };
          case (?from, ?to) { p.updated_at >= from and p.updated_at <= to };
        };

        let globalSearchMatch = if (Text.size(search) == 0) {
          true;
        } else {
          let searchLower = Text.toLowercase(search);
          Text.contains(Text.toLowercase(p.name), #text(searchLower)) or
          Text.contains(Text.toLowercase(p.description), #text(searchLower)) or
          Text.contains(Text.toLowercase(p.sku), #text(searchLower)) or
          Text.contains(Text.toLowercase(p.category), #text(searchLower)) or
          Text.contains(Int.toText(p.quantity), #text(searchLower)) or
          Text.contains(Float.toText(p.price), #text(searchLower)) or
          Text.contains(Int.toText(p.ordering), #text(searchLower)) or
          Text.contains(Nat.toText(p.status), #text(searchLower));
        };

        nameMatch and categoryMatch and skuMatch and statusMatch and orderingMatch and createdDateMatch and updatedDateMatch and globalSearchMatch;
      },
    );

    let sorted = Array.sort<Product>(
      filtered,
      func(a : Product, b : Product) : { #less; #equal; #greater } {
        let order = if (sortOrder == "desc") { #greater } else { #less };
        switch (sortBy) {
          case ("name") { if (a.name < b.name) order else if (a.name > b.name) { if (order == #less) #greater else #less } else #equal };
          case ("price") { if (a.price < b.price) order else if (a.price > b.price) { if (order == #less) #greater else #less } else #equal };
          case ("quantity") { if (a.quantity < b.quantity) order else if (a.quantity > b.quantity) { if (order == #less) #greater else #less } else #equal };
          case ("category") { if (a.category < b.category) order else if (a.category > b.category) { if (order == #less) #greater else #less } else #equal };
          case ("sku") { if (a.sku < b.sku) order else if (a.sku > b.sku) { if (order == #less) #greater else #less } else #equal };
          case ("status") { if (a.status < b.status) order else if (a.status > b.status) { if (order == #less) #greater else #less } else #equal };
          case ("ordering") { if (a.ordering < b.ordering) order else if (a.ordering > b.ordering) { if (order == #less) #greater else #less } else #equal };
          case ("created_at") { if (a.created_at < b.created_at) order else if (a.created_at > b.created_at) { if (order == #less) #greater else #less } else #equal };
          case ("updated_at") { if (a.updated_at < b.updated_at) order else if (a.updated_at > b.updated_at) { if (order == #less) #greater else #less } else #equal };
          case (_) { if (a.id < b.id) order else if (a.id > b.id) { if (order == #less) #greater else #less } else #equal };
        };
      },
    );

    let totalCount = sorted.size();
    let totalPages = if (totalCount == 0) { 1 } else {
      (totalCount + limit - 1) / limit;
    };

    let currentPage = if (page == 0) { 1 } else if (page > totalPages) { totalPages } else { page };
    let start = (currentPage - 1) * limit;
    let end = if (start + limit > totalCount) { totalCount } else { start + limit };

    let paged = Array.subArray(sorted, start, end - start);

    {
      products = paged;
      totalCount;
      currentPage;
      totalPages;
      hasNextPage = currentPage < totalPages;
      hasPreviousPage = currentPage > 1;
    };
  };

  public func updateProduct(id : Nat, input : ProductInput) : async Product {
    switch (natMap.get(products, id)) {
      case (null) { Debug.trap("Product not found") };
      case (?existing) {
        if (Text.size(input.name) == 0) {
          Debug.trap("Product name is required");
        };

        if (Float.equal(input.price, 0.0)) {
          Debug.trap("Product price is required");
        };

        if (input.sku != existing.sku and textMap.contains(skuIndex, input.sku)) {
          Debug.trap("SKU must be unique");
        };

        let now = Time.now();

        let updated : Product = {
          id = existing.id;
          name = input.name;
          description = input.description;
          price = input.price;
          quantity = input.quantity;
          category = input.category;
          sku = input.sku;
          status = input.status;
          ordering = input.ordering;
          imagePath = input.imagePath;
          created_at = existing.created_at;
          updated_at = now;
        };

        products := natMap.put(products, id, updated);

        if (input.sku != existing.sku) {
          skuIndex := textMap.delete(skuIndex, existing.sku);
          skuIndex := textMap.put(skuIndex, input.sku, id);
        };

        updated;
      };
    };
  };

  public func updateProductFields(id : Nat, fields : ProductUpdateFields) : async Product {
    switch (natMap.get(products, id)) {
      case (null) { Debug.trap("Product not found") };
      case (?existing) {
        let now = Time.now();

        let updated : Product = {
          id = existing.id;
          name = existing.name;
          description = existing.description;
          price = switch (fields.price) { case (null) { existing.price }; case (?p) { p } };
          quantity = switch (fields.quantity) { case (null) { existing.quantity }; case (?q) { q } };
          category = existing.category;
          sku = existing.sku;
          status = switch (fields.status) { case (null) { existing.status }; case (?s) { s } };
          ordering = switch (fields.ordering) { case (null) { existing.ordering }; case (?o) { o } };
          imagePath = existing.imagePath;
          created_at = existing.created_at;
          updated_at = now;
        };

        products := natMap.put(products, id, updated);
        updated;
      };
    };
  };

  public func updateProductsBatch(ids : [Nat], fields : ProductUpdateFields) : async Nat {
    var updatedCount = 0;

    for (id in ids.vals()) {
      switch (natMap.get(products, id)) {
        case (null) {};
        case (?existing) {
          let now = Time.now();

          let updated : Product = {
            id = existing.id;
            name = existing.name;
            description = existing.description;
            price = switch (fields.price) { case (null) { existing.price }; case (?p) { p } };
            quantity = switch (fields.quantity) { case (null) { existing.quantity }; case (?q) { q } };
            category = existing.category;
            sku = existing.sku;
            status = switch (fields.status) { case (null) { existing.status }; case (?s) { s } };
            ordering = switch (fields.ordering) { case (null) { existing.ordering }; case (?o) { o } };
            imagePath = existing.imagePath;
            created_at = existing.created_at;
            updated_at = now;
          };

          products := natMap.put(products, id, updated);
          updatedCount += 1;
        };
      };
    };

    updatedCount;
  };

  public func deleteProduct(id : Nat) : async () {
    switch (natMap.get(products, id)) {
      case (null) { Debug.trap("Product not found") };
      case (?product) {
        products := natMap.delete(products, id);
        skuIndex := textMap.delete(skuIndex, product.sku);
      };
    };
  };

  public func deleteProductsBatch(ids : [Nat]) : async BatchDeleteResult {
    var deletedCount = 0;

    for (id in ids.vals()) {
      switch (natMap.get(products, id)) {
        case (null) {};
        case (?product) {
          products := natMap.delete(products, id);
          skuIndex := textMap.delete(skuIndex, product.sku);
          deletedCount += 1;
        };
      };
    };

    {
      deletedCount;
      requestedCount = ids.size();
    };
  };

  public query func getStatusText(status : Nat) : async Text {
    switch (status) {
      case (0) { "None" };
      case (1) { "In Stock" };
      case (2) { "Out of Stock" };
      case (3) { "Pre-order Available" };
      case (4) { "Discontinued" };
      case (5) { "Backorder Available" };
      case (6) { "Coming Soon" };
      case (7) { "Limited Stock Available" };
      case (8) { "Reserved for Customers" };
      case (9) { "Restock Expected" };
      case (10) { "Not for Sale" };
      case (_) { "Unknown" };
    };
  };

  public query func getAllCategories() : async [Text] {
    let allProducts = Iter.toArray(natMap.vals(products));
    let categories = Array.map<Product, Text>(allProducts, func(p : Product) : Text { p.category });

    let categoryMap = textMap.empty<Bool>();
    let uniqueCategories = Array.foldLeft<Text, OrderedMap.Map<Text, Bool>>(
      categories,
      categoryMap,
      func(map, category) {
        textMap.put(map, category, true);
      },
    );

    Iter.toArray(textMap.keys(uniqueCategories));
  };

  public shared ({ caller }) func registerFileReference(path : Text, hash : Text) : async () {
    Registry.add(registry, path, hash);
  };

  public query ({ caller }) func getFileReference(path : Text) : async Registry.FileReference {
    Registry.get(registry, path);
  };

  public query ({ caller }) func listFileReferences() : async [Registry.FileReference] {
    Registry.list(registry);
  };

  public shared ({ caller }) func dropFileReference(path : Text) : async () {
    Registry.remove(registry, path);
  };
};

