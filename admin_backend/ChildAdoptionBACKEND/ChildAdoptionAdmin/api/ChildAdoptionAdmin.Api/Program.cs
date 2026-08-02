using System.Text;
using ChildAdoptionAdmin.Api.Data;
using ChildAdoptionAdmin.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:5080");

var connectionString = builder.Configuration.GetConnectionString("Default");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("Connection string 'Default' is missing in appsettings.json.");

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
    throw new InvalidOperationException("Jwt:Key must contain at least 32 characters.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = System.Security.Claims.ClaimTypes.Role,
        NameClaimType = System.Security.Claims.ClaimTypes.Name
    };
});

builder.Services.AddAuthorization();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<ChildAdoptionAdmin.Api.Repositories.ISocialWorkerRepository, ChildAdoptionAdmin.Api.Repositories.SocialWorkerRepository>();
builder.Services.AddScoped<ChildAdoptionAdmin.Api.Repositories.IHomeVisitRepository, ChildAdoptionAdmin.Api.Repositories.HomeVisitRepository>();
builder.Services.AddScoped<ChildAdoptionAdmin.Api.Services.ISocialWorkerService, ChildAdoptionAdmin.Api.Services.SocialWorkerService>();
builder.Services.AddScoped<ChildAdoptionAdmin.Api.Services.IHomeVisitService, ChildAdoptionAdmin.Api.Services.HomeVisitService>();

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AdminPortal", policy =>
    {
        if (allowedOrigins.Length > 0)
            policy.WithOrigins(allowedOrigins);
        else
            policy.AllowAnyOrigin();

        policy.AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Child Adoption System - Admin API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste only the JWT token received from POST /api/auth/login"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Keep Swagger available while developing and testing locally.
app.UseSwagger();
app.UseSwaggerUI();

var searchLocations = new[]
{
    Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "..", "..", "..", "..", "user_backend", "spring_boot_backend_template", "uploads")),
    Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "..", "..", "..", "user_backend", "spring_boot_backend_template", "uploads")),
    @"D:\cdac\prfi\Child_Adoption_System\user_backend\spring_boot_backend_template\uploads"
};

var uploadsPathUserBackend = searchLocations.FirstOrDefault(Directory.Exists);
if (!string.IsNullOrEmpty(uploadsPathUserBackend))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPathUserBackend),
        RequestPath = "/uploads"
    });
}

var uploadsPathAdmin = Path.Combine(builder.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPathAdmin))
{
    Directory.CreateDirectory(uploadsPathAdmin);
}
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPathAdmin),
    RequestPath = "/uploads"
});

app.UseCors("AdminPortal");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

await DatabaseSeeder.SeedAsync(app.Services);

app.Run();
