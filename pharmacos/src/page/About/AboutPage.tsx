import React from 'react';
import './AboutPage.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
    Heart,
    Shield,
    Users,
    Award,
    Clock,
    MapPin,
    Phone,
    Mail,
    Star,
    CheckCircle,
    Globe,
    Truck
} from 'lucide-react';

const AboutPage = () => {
    const stats = [
        { icon: Users, label: 'Happy Customers', value: '10,000+' },
        { icon: Award, label: 'Years of Experience', value: '15+' },
        { icon: Globe, label: 'Branches', value: '25+' },
        { icon: CheckCircle, label: 'Quality Products', value: '5,000+' }
    ];

    const values = [
        {
            icon: Heart,
            title: 'Dedicated Care',
            description: 'We always put the health and satisfaction of our customers first.'
        },
        {
            icon: Shield,
            title: 'Safety & Quality',
            description: 'All products are strictly tested and have clear origins.'
        },
        {
            icon: Clock,
            title: '24/7 Service',
            description: 'Our customer support and consultation services are available around the clock.'
        },
        {
            icon: Truck,
            title: 'Fast Delivery',
            description: 'Reliable and fast home delivery system.'
        }
    ];

    const team = [
        {
            name: 'Dr. Nguyen Van A',
            role: 'Chief Pharmacist',
            experience: '20 years of experience',
            image: '/api/placeholder/150/150'
        },
        {
            name: 'MSc. Tran Thi B',
            role: 'Nutrition Expert',
            experience: '15 years of experience',
            image: '/api/placeholder/150/150'
        },
        {
            name: 'Dr. Le Van C',
            role: 'Consulting Doctor',
            experience: '12 years of experience',
            image: '/api/placeholder/150/150'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Hero Section */}
            <section className="relative py-20 px-4 text-center">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <Badge variant="secondary" className="mb-4 px-4 py-2 text-lg">
                            About PharmaCos
                        </Badge>
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            Your trusted partner for
                            <span className="text-blue-600"> health</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            With over 15 years of experience in the pharmaceutical field, PharmaCos is committed to providing
                            high-quality products and the best healthcare services for every family in Vietnam.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                        {stats.map((stat, index) => (
                            <Card key={index} className="text-center stat-card card-hover-effect">
                                <CardContent className="pt-6">
                                    <stat.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                                    <p className="text-gray-600">{stat.label}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            To create a comprehensive healthcare ecosystem where everyone can easily access high-quality pharmaceutical products.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <Card key={index} className="text-center value-card">
                                <CardHeader>
                                    <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                        <value.icon className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-xl mb-3">{value.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-gray-600 leading-relaxed">
                                        {value.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">Our Story</h2>
                            <div className="space-y-6 text-lg">
                                <p>
                                    PharmaCos was founded in 2009 with a simple yet noble goal:
                                    to bring everyone the best healthcare products at reasonable prices.
                                </p>
                                <p>
                                    From a small pharmacy, we have grown into one of the most reputable pharmaceutical chains in Vietnam with 25+ branches nationwide.
                                </p>
                                <p>
                                    Today, PharmaCos proudly serves over 10,000 customers with a team of experienced pharmacists and healthcare experts.
                                </p>
                            </div>
                            <Button variant="secondary" size="lg" className="mt-8">
                                See more achievements
                            </Button>
                        </div>
                        <div className="relative">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-2">2009</div>
                                        <div className="text-blue-200">Year Founded</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-2">25+</div>
                                        <div className="text-blue-200">Branches</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-2">10K+</div>
                                        <div className="text-blue-200">Customers</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-2">5K+</div>
                                        <div className="text-blue-200">Products</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Experts</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Leading experts in pharmaceuticals and healthcare
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {team.map((member, index) => (
                            <Card key={index} className="text-center card-hover-effect">
                                <CardHeader>
                                    <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                                        <Users className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <CardTitle className="text-xl">{member.name}</CardTitle>
                                    <CardDescription className="text-blue-600 font-medium">
                                        {member.role}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">{member.experience}</p>
                                    <div className="flex justify-center mt-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h2>
                        <p className="text-xl text-gray-600">
                            We are always ready to support you 24/7
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="text-center contact-card">
                            <CardContent className="pt-8">
                                <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                    <MapPin className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Address</h3>
                                <p className="text-gray-600">
                                    123 ABC Street, District 1<br />
                                    Ho Chi Minh City, Vietnam
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="text-center contact-card">
                            <CardContent className="pt-8">
                                <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                    <Phone className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Hotline</h3>
                                <p className="text-gray-600">
                                    1900-xxxx (toll free)<br />
                                    028-xxxx-xxxx
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="text-center contact-card">
                            <CardContent className="pt-8">
                                <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                    <Mail className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Email</h3>
                                <p className="text-gray-600">
                                    info@pharmacos.vn<br />
                                    support@pharmacos.vn
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="text-center mt-12">
                        <Button size="lg" className="px-8">
                            Contact Now
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
