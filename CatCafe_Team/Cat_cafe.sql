DROP DATABASE IF EXISTS cat_cafe;
CREATE DATABASE cat_cafe;
USE cat_cafe;

CREATE TABLE food (
WeekDay VARCHAR(10), 
FoodName VARCHAR(45), 
Price INT, 
Picture TEXT, 
Idioma VARCHAR(8));
 
CREATE TABLE cats (
CatPicture TEXT, 
CatName VARCHAR(15), 
CatAge VARCHAR(10), 
CatCharacter VARCHAR(25), 
Idioma VARCHAR(8));


INSERT INTO cats(CatPicture,CatName,CatAge,CatCharacter,Idioma) VALUES
	#English
	("https://www.purina.es/sites/default/files/styles/ttt_image_510/public/2024-02/sitesdefaultfilesstylessquare_medium_440x440public2022-06Abyssinian.1_0.jpg?itok=l0P3MGqz","Whiskey",3,"Calm & Affectionate","English"),
    ("https://static.bainet.es/clip/4c9b50c3-7120-4668-a0b5-219b43748810_source-aspect-ratio_1200w_0.jpg","Shadow",1,"Mysterious & Playfull","English"),
    ("https://images.unsplash.com/photo-1692545219507-f37e87360f5f?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGdhdG8lMjBwZWx1ZG8lMjBibGFuY298ZW58MHx8MHx8fDA%3D","Bigotes",4,"Chatty & Energetic","English"),
    ("https://cdn0.expertoanimal.com/es/posts/7/3/2/razas_de_gatos_blancos_24237_orig.jpg","Fluffy",6,"Sweet & Curious","English"),
    ("https://urgenciesveterinaries.com/wp-content/uploads/2023/09/survet-gato-caida-pelo-01.jpeg","Mango",2,"Gentle & Shy","English"),
    #Español
    ("https://www.purina.es/sites/default/files/styles/ttt_image_510/public/2024-02/sitesdefaultfilesstylessquare_medium_440x440public2022-06Abyssinian.1_0.jpg?itok=l0P3MGqz","Whiskey",3,"Tranquilo y Cariñoso","Español"),
    ("https://static.bainet.es/clip/4c9b50c3-7120-4668-a0b5-219b43748810_source-aspect-ratio_1200w_0.jpg","Shadow",1,"Misterioso y Juguetón","Español"),
    ("https://images.unsplash.com/photo-1692545219507-f37e87360f5f?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGdhdG8lMjBwZWx1ZG8lMjBibGFuY298ZW58MHx8MHx8fDA%3D","Bigotes",4,"Platicador y Energético","Español"),
    ("https://cdn0.expertoanimal.com/es/posts/7/3/2/razas_de_gatos_blancos_24237_orig.jpg","Fluffy",6,"Dulce y Curiosa","Español"),
    ("https://urgenciesveterinaries.com/wp-content/uploads/2023/09/survet-gato-caida-pelo-01.jpeg","Mango",2,"Gentil y Tímido","Español");
    
INSERT INTO food(WeekDay,FoodName,Price,Picture,Idioma) VALUES
	#English
    ("Monday","Matcha Latte",59,"https://www.recetasnestlecam.com/sites/default/files/srh_recipes/d25b198c592bdad94cf2902ff4e5634d.jpg","English"),
    ("Monday","Tuna Sandwich",99,"https://mojo.generalmills.com/api/public/content/iCXFwJd80U6TMhTZKYyA-w_gmi_hi_res_jpeg.jpeg?v=86a29367&t=466b54bb264e48b199fc8e83ef1136b4","English"),
    ("Monday","Chocolate Milkshake",65,"https://cdn7.kiwilimon.com/recetaimagen/37834/640x640/48042.jpg.jpg","English"),
    
    ("Martes","Pancakes",89,"https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480_1_5x/img/recipe/ras/Assets/4c0b128e-9851-4c56-84bd-e8368157948c/Derivates/130a57d2-0318-4dea-83e0-a3e908e67133.jpg","English"),
    ("Martes","Espresso",55,"https://www.sharmispassions.com/wp-content/uploads/2012/07/espresso-coffee-recipe04-500x375.jpg","English"),
    ("Martes","Chocolate Chip Cookie",29,"https://cdn7.kiwilimon.com/recetaimagen/3329/960x640/38990.jpg.jpg","English"),
    
    ("Miércoles","Macarons",49,"https://imgmedia.buenazo.pe/970x533/buenazo/original/2020/10/26/5f970a772f64783bc0287eba.webp","English"),
    ("Miércoles","Tea",30,"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxhrNf622wZbBDsr2xkujdCHZOW4nuGLF7-Q&s","English"),
    ("Miércoles","Cheescake",79,"https://i.blogs.es/550ed3/cheesecake/450_1000.jpg","English"),
    
    ("Jueves","Croissant",39,"https://es.cravingsjournal.com/wp-content/uploads/2024/04/croissant-tiramisu-1.jpg","English"),
    ("Jueves","Vanilla Milkshake",65,"https://dgari.com/wp-content/uploads/2024/04/malteada-de-vainilla-y-caramelo.jpg","English"),
    ("Jueves","Avocado Toast",59,"https://www.rootsandradishes.com/wp-content/uploads/2017/08/avocado-toast-with-everything-bagel-seasoning-feat.jpg","English"),
    
    ("Viernes","Waffles",79,"https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480/img/recipe/ras/Assets/c6ea15c4-52ab-4119-b886-a7fb1d052f45/Derivates/b18fcddc-3b31-4ae9-9cd1-5a81751d91b3.jpg","English"),
    ("Viernes","Cat-puccino",59,"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW8xHOZA9fxl5Sc0JxaRcRFNbKQVJBhEGfug&s","English"),
    ("Viernes","French Toast",39,"https://www.chilitochoc.com/wp-content/uploads/2025/04/buttermilk-french-toast-recipe-500x375.jpg","English"),
    
    ("Sábado","Chocolate Cake",89,"https://www.cocinadelirante.com/sites/default/files/images/2020/03/como-hacer-pastel-de-chocolate-con-cerveza-y-betun.jpg","English"),
    ("Sábado","Strawberry Lemonade",39,"https://i.ytimg.com/vi/IGPMktOdlT8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLClvN1caJQDQwYx2wFFIa7d30n6Ng","English"),
    ("Sábado","Lemonade",35,"https://www.texanerin.com/content/uploads/2014/08/honey-lemonade-2.jpg","English"),
    
    ("Domingo","Brownie with Icecream",60,"https://mandolina.co/wp-content/uploads/2020/11/brownie-con-helado-destacada.jpg","English"),
    ("Domingo","Hot Chocolate",49,"https://www.novachef.es/media/images/chocolate-caliente-especias.jpg","English"),
    ("Domingo","Manju",35,"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg2Q0aLUXtJKVCXecsPWl2arVD1vbWdD6R4A&s","English"),
    
    #Español
	("Lunes","Latte con Matcha",59,"https://www.recetasnestlecam.com/sites/default/files/srh_recipes/d25b198c592bdad94cf2902ff4e5634d.jpg","Español"),
    ("Lunes","Sándwitch de Atún",99,"https://mojo.generalmills.com/api/public/content/iCXFwJd80U6TMhTZKYyA-w_gmi_hi_res_jpeg.jpeg?v=86a29367&t=466b54bb264e48b199fc8e83ef1136b4","Español"),
    ("Lunes","Malteada de Chocolate",65,"https://cdn7.kiwilimon.com/recetaimagen/37834/640x640/48042.jpg.jpg","Español"),
    
    ("Martes","Panqueques",89,"https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480_1_5x/img/recipe/ras/Assets/4c0b128e-9851-4c56-84bd-e8368157948c/Derivates/130a57d2-0318-4dea-83e0-a3e908e67133.jpg","Español"),
    ("Martes","Cafe Espresso",55,"https://www.sharmispassions.com/wp-content/uploads/2012/07/espresso-coffee-recipe04-500x375.jpg","Español"),
    ("Martes","Galleta de Chispas de Chocolate",29,"https://cdn7.kiwilimon.com/recetaimagen/3329/960x640/38990.jpg.jpg","Español"),
    
    ("Miércoles","Macarrones",49,"https://imgmedia.buenazo.pe/970x533/buenazo/original/2020/10/26/5f970a772f64783bc0287eba.webp","Español"),
    ("Miércoles","Té",30,"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxhrNf622wZbBDsr2xkujdCHZOW4nuGLF7-Q&s","Español"),
    ("Miércoles","Pastel de Queso",79,"https://i.blogs.es/550ed3/cheesecake/450_1000.jpg","Español"),
    
    ("Jueves","Croissant",39,"https://es.cravingsjournal.com/wp-content/uploads/2024/04/croissant-tiramisu-1.jpg","Español"),
    ("Jueves","Malteada de Vainilla",65,"https://dgari.com/wp-content/uploads/2024/04/malteada-de-vainilla-y-caramelo.jpg","Español"),
    ("Jueves","Tostada de Aguacate",59,"https://www.rootsandradishes.com/wp-content/uploads/2017/08/avocado-toast-with-everything-bagel-seasoning-feat.jpg","Español"),
    
    ("Viernes","Waffles",79,"https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480/img/recipe/ras/Assets/c6ea15c4-52ab-4119-b886-a7fb1d052f45/Derivates/b18fcddc-3b31-4ae9-9cd1-5a81751d91b3.jpg","Español"),
    ("Viernes","Cat-puccino",59,"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW8xHOZA9fxl5Sc0JxaRcRFNbKQVJBhEGfug&s","Español"),
    ("Viernes","Pan Francés",39,"https://www.chilitochoc.com/wp-content/uploads/2025/04/buttermilk-french-toast-recipe-500x375.jpg","Español"),
    
    ("Sábado","Pastel de Chocolate",89,"https://www.cocinadelirante.com/sites/default/files/images/2020/03/como-hacer-pastel-de-chocolate-con-cerveza-y-betun.jpg","Español"),
    ("Sábado","Limonada de Fresa",39,"https://i.ytimg.com/vi/IGPMktOdlT8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLClvN1caJQDQwYx2wFFIa7d30n6Ng","Español"),
    ("Sábado","Limonada",35,"https://www.texanerin.com/content/uploads/2014/08/honey-lemonade-2.jpg","Español"),
    
    ("Domingo","Brownie con Helado",60,"https://mandolina.co/wp-content/uploads/2020/11/brownie-con-helado-destacada.jpg","Español"),
    ("Domingo","Chocolate Caliente",49,"https://www.novachef.es/media/images/chocolate-caliente-especias.jpg","Español"),
    ("Domingo","Manju",35,"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg2Q0aLUXtJKVCXecsPWl2arVD1vbWdD6R4A&s","Español");