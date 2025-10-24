import OrderedMap "mo:base/OrderedMap";
import BlobStorage "blob-storage/Mixin";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Registry "blob-storage/registry";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import Principal "mo:base/Principal";

actor ProductManager {
  transient let natMap = OrderedMap.Make<Nat>(Nat.compare);
  transient let textMap = OrderedMap.Make<Text>(Text.compare);
  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);

  var products : OrderedMap.Map<Nat, Product> = natMap.empty<Product>();
  var skuIndex : OrderedMap.Map<Text, Nat> = textMap.empty<Nat>();
  var nextId : Nat = 1;

  let registry = Registry.new();

  // Authorization state
  let accessControlState = AccessControl.initState();

  // Stripe configuration
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public type DiscountType = {
    #percentage;
    #currency;
  };

  public type Discount = {
    discountType : DiscountType;
    value : Float;
  };

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
    discount : ?Discount;
    created_at : Int;
    updated_at : Int;
    createdBy : Principal;
    updatedBy : Principal;
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
    discount : ?Discount;
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
    discount : ?Discount;
  };

  public type ShoppingCartItem = {
    productId : Nat;
    quantity : Int;
  };

  public type OrderItem = {
    productId : Nat;
    quantity : Int;
    price : Float;
    discount : ?Discount;
  };

  public type OrderStatus = {
    #pending;
    #paid;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type Order = {
    id : Nat;
    items : [OrderItem];
    totalAmount : Float;
    status : OrderStatus;
    created_at : Int;
    updated_at : Int;
    paymentIntentId : ?Text;
  };

  public type OrderInput = {
    items : [OrderItem];
    totalAmount : Float;
    paymentIntentId : ?Text;
  };

  public type OrderPage = {
    orders : [Order];
    totalCount : Nat;
    currentPage : Nat;
    totalPages : Nat;
    hasNextPage : Bool;
    hasPreviousPage : Bool;
  };

  var orders : OrderedMap.Map<Nat, Order> = natMap.empty<Order>();
  var nextOrderId : Nat = 1;

  public type UserProfile = {
    name : Text;
    // Add other user metadata fields as needed
  };

  var userProfiles : OrderedMap.Map<Principal, UserProfile> = principalMap.empty<UserProfile>();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    principalMap.get(userProfiles, caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    principalMap.get(userProfiles, user);
  };

  public shared ({ caller }) func createProduct(input : ProductInput) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can create products");
    };

    if (Text.size(input.name) == 0) {
      Debug.trap("Product name is required");
    };

    if (input.price == 0.0) {
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
      discount = input.discount;
      created_at = now;
      updated_at = now;
      createdBy = caller;
      updatedBy = caller;
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
        if (a.ordering < b.ordering) #less else if (a.ordering > b.ordering) #greater else #equal;
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

  public shared ({ caller }) func updateProduct(id : Nat, input : ProductInput) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update products");
    };

    switch (natMap.get(products, id)) {
      case (null) { Debug.trap("Product not found") };
      case (?existing) {
        if (Text.size(input.name) == 0) {
          Debug.trap("Product name is required");
        };

        if (input.price == 0.0) {
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
          discount = input.discount;
          created_at = existing.created_at;
          updated_at = now;
          createdBy = existing.createdBy;
          updatedBy = caller;
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

  public shared ({ caller }) func updateProductFields(id : Nat, fields : ProductUpdateFields) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update product fields");
    };

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
          discount = switch (fields.discount) { case (null) { existing.discount }; case (?d) { ?d } };
          created_at = existing.created_at;
          updated_at = now;
          createdBy = existing.createdBy;
          updatedBy = caller;
        };

        products := natMap.put(products, id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func updateProductsBatch(ids : [Nat], fields : ProductUpdateFields) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update products batch");
    };

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
            discount = switch (fields.discount) { case (null) { existing.discount }; case (?d) { ?d } };
            created_at = existing.created_at;
            updated_at = now;
            createdBy = existing.createdBy;
            updatedBy = caller;
          };

          products := natMap.put(products, id, updated);
          updatedCount += 1;
        };
      };
    };

    updatedCount;
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can delete products");
    };

    switch (natMap.get(products, id)) {
      case (null) { Debug.trap("Product not found") };
      case (?product) {
        products := natMap.delete(products, id);
        skuIndex := textMap.delete(skuIndex, product.sku);
      };
    };
  };

  public shared ({ caller }) func deleteProductsBatch(ids : [Nat]) : async BatchDeleteResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can delete products batch");
    };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can register file references");
    };
    Registry.add(registry, path, hash);
  };

  public query ({ caller }) func getFileReference(path : Text) : async Registry.FileReference {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can get file references");
    };
    Registry.get(registry, path);
  };

  public query ({ caller }) func listFileReferences() : async [Registry.FileReference] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can list file references");
    };
    Registry.list(registry);
  };

  public shared ({ caller }) func dropFileReference(path : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can drop file references");
    };
    Registry.remove(registry, path);
  };

  include BlobStorage(registry);

  public shared func createOrder(input : OrderInput) : async Order {
    let now = Time.now();
    let id = nextOrderId;
    nextOrderId += 1;

    let order : Order = {
      id;
      items = input.items;
      totalAmount = input.totalAmount;
      status = #pending;
      created_at = now;
      updated_at = now;
      paymentIntentId = input.paymentIntentId;
    };

    orders := natMap.put(orders, id, order);
    order;
  };

  public query func getOrder(id : Nat) : async ?Order {
    natMap.get(orders, id);
  };

  public query func getAllOrders(
    page : Nat,
    limit : Nat,
    statusFilter : ?OrderStatus,
    sortBy : Text,
    sortOrder : Text,
  ) : async OrderPage {
    let allOrders = Iter.toArray(natMap.vals(orders));

    let filtered = Array.filter<Order>(
      allOrders,
      func(o : Order) : Bool {
        switch (statusFilter) {
          case (null) { true };
          case (?status) { o.status == status };
        };
      },
    );

    let sorted = Array.sort<Order>(
      filtered,
      func(a : Order, b : Order) : { #less; #equal; #greater } {
        if (a.created_at < b.created_at) #less else if (a.created_at > b.created_at) #greater else #equal;
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
      orders = paged;
      totalCount;
      currentPage;
      totalPages;
      hasNextPage = currentPage < totalPages;
      hasPreviousPage = currentPage > 1;
    };
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : OrderStatus) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update order status");
    };

    switch (natMap.get(orders, id)) {
      case (null) { Debug.trap("Order not found") };
      case (?existing) {
        let now = Time.now();

        let updated : Order = {
          id = existing.id;
          items = existing.items;
          totalAmount = existing.totalAmount;
          status;
          created_at = existing.created_at;
          updated_at = now;
          paymentIntentId = existing.paymentIntentId;
        };

        orders := natMap.put(orders, id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func updateOrderPaymentIntent(id : Nat, paymentIntentId : Text) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can update order payment intent");
    };

    switch (natMap.get(orders, id)) {
      case (null) { Debug.trap("Order not found") };
      case (?existing) {
        let now = Time.now();

        let updated : Order = {
          id = existing.id;
          items = existing.items;
          totalAmount = existing.totalAmount;
          status = existing.status;
          created_at = existing.created_at;
          updated_at = now;
          paymentIntentId = ?paymentIntentId;
        };

        orders := natMap.put(orders, id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    switch (stripeConfig) {
      case (null) { Debug.trap("Stripe configuration not set") };
      case (?config) {
        await Stripe.getSessionStatus(config, sessionId, transform);
      };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    switch (stripeConfig) {
      case (null) { Debug.trap("Stripe configuration not set") };
      case (?config) {
        await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
      };
    };
  };
};

