using Microsoft.AspNetCore.Localization;
using System.Globalization;
using Microsoft.AspNetCore.Mvc.NewtonsoftJson; // Add this using directive

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
  options.IdleTimeout = TimeSpan.FromMinutes(30);
  options.Cookie.HttpOnly = true;
  options.Cookie.IsEssential = true;
});

builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
builder.Services.AddMvc().AddViewLocalization(Microsoft.AspNetCore.Mvc.Razor.LanguageViewLocationExpanderFormat.Suffix).AddDataAnnotationsLocalization();
builder.Services.Configure<RequestLocalizationOptions>(options =>
{
  var supportedCultures = new[]
  {
      new CultureInfo("en"),
      new CultureInfo("fr"),
      new CultureInfo("es"),
      new CultureInfo("ar"),
      new CultureInfo("bn"),
  };
  options.DefaultRequestCulture = new RequestCulture("en");
  options.SupportedCultures = supportedCultures;
  options.SupportedUICultures = supportedCultures;

  //options.RequestCultureProviders.Insert(0, new CustomRequestCultureProvider(context =>
  //{
  //    var languages = context.Request.Headers["Accept-Language"].ToString();
  //    var currentLanguage = languages.Split(',').FirstOrDefault();
  //    var defaultLanguage = string.IsNullOrEmpty(currentLanguage) ? "en" : currentLanguage;

  //    if (defaultLanguage != "de" && defaultLanguage != "en-US")
  //    {
  //        defaultLanguage = "en-US";
  //    }

  //    return Task.FromResult(new ProviderCultureResult(defaultLanguage, defaultLanguage));
  //}));
});

builder.Services.AddControllersWithViews().AddNewtonsoftJson(options =>
  options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
);

builder.Services.AddRazorPages();
builder.Services.AddMvc();


builder.Services.AddCors(options =>
{
  options.AddDefaultPolicy(
    builder =>
    {
      builder.WithOrigins("http://localhost:3000")
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
  app.UseExceptionHandler("/Home/Error");
  // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
  app.UseHsts();
}

app.UseStaticFiles();

app.UseHttpsRedirection();
app.UseSession();
app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Login}/{id?}")
    .WithStaticAssets();

app.UseCors();
app.Run();
