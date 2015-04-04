//
//  CUTERentAddressMapViewController.m
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentAddressMapViewController.h"
#import <MapKit/MapKit.h>
#import "CUTECommonMacro.h"
#import "FXForms.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTEMapTextField.h"
#import "CUTERentAddressEditForm.h"

@interface CUTERentAddressMapViewController () <MKMapViewDelegate, CLLocationManagerDelegate, UITextFieldDelegate>
{
    MKMapView *_mapView;

    CUTEMapTextField *_textField;

    UIButton *_userLocationButton;

    CLLocationManager *_locationManager;

    CLLocation *_location;
}

@property (nonatomic, strong) CLLocationManager *loationManager;

@end

@implementation CUTERentAddressMapViewController

- (instancetype)init
{
    self = [super init];
    if (self) {

    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"地址");
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"继续") style:UIBarButtonItemStylePlain target:self action:@selector(onRightButtonPressed:)];

    _locationManager = [[CLLocationManager alloc] init];
    [_locationManager requestWhenInUseAuthorization];
    [_loationManager startUpdatingLocation];
    _loationManager.delegate = self;
#ifdef __IPHONE_8_0
    // Use one or the other, not both. Depending on what you put in info.plist
    [_loationManager requestWhenInUseAuthorization];
    [_loationManager requestAlwaysAuthorization];
#endif

    _mapView = [[MKMapView alloc] init];
    _mapView.frame = self.view.bounds;
    _mapView.delegate = self;
    _mapView.showsUserLocation = YES;
    [_mapView setMapType:MKMapTypeStandard];
    [_mapView setZoomEnabled:YES];
    [_mapView setScrollEnabled:YES];
    [self.view addSubview:_mapView];

    _textField = [[CUTEMapTextField alloc] initWithFrame:CGRectMake(16, 30 + TouchHeightDefault + StatusBarHeight, ScreenWidth - 32, 60)];
    _textField.rightView = [[UIImageView alloc] initWithImage:IMAGE(@"map-address-location")];
    _textField.rightViewMode = UITextFieldViewModeAlways;
    _textField.background = [[UIImage imageNamed:@"map-textfield-background"] resizableImageWithCapInsets:UIEdgeInsetsMake(10, 10, 10, 10)];
    _textField.delegate = self;
    [self.view addSubview:_textField];
    _textField.rightView.userInteractionEnabled = YES;
    [_textField.rightView addGestureRecognizer:[[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(onAddressLocationButtonTapped:)]];

    _userLocationButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [_userLocationButton setImage:IMAGE(@"map-user-location") forState:UIControlStateNormal];
    _userLocationButton.frame = CGRectMake(ScreenWidth - 40 -15, ScreenHeight - TabBarHeight - 40 - 15, 40, 40);
    [self.view addSubview:_userLocationButton];
    [_userLocationButton addTarget:self action:@selector(onUserLocationButtonPressed:) forControlEvents:UIControlEventTouchUpInside];

}

-(void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:YES];

    _locationManager.distanceFilter = kCLDistanceFilterNone;
    _locationManager.desiredAccuracy = kCLLocationAccuracyBest;
    [_locationManager startUpdatingLocation];
}


- (void)onAddressBeginEditing:(id)sender {
    FXFormViewController *controller = [[FXFormViewController alloc] init];
    controller.formController.form = [CUTERentAddressEditForm new];
    controller.navigationItem.title = STR(@"位置");
    controller.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"保存") style:UIBarButtonItemStylePlain target:nil action:nil];
    [self.navigationController pushViewController:controller animated:YES];
}

- (void)onAddressLocationButtonTapped:(id)sender {

}

- (void)onUserLocationButtonPressed:(id)sender {
    _location = nil;
    [_locationManager startUpdatingLocation];
}

- (void)onRightButtonPressed:(id)sender {
    FXFormViewController *controller = [[FXFormViewController alloc] init];
    controller.formController.form = [CUTEPropertyInfoForm new];
    controller.navigationItem.title = STR(@"房产信息");
    controller.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"预览") style:UIBarButtonItemStylePlain target:nil action:nil];
    [self.navigationController pushViewController:controller animated:YES];
}

- (void)mapView:(MKMapView *)mapView regionDidChangeAnimated:(__unused BOOL)animated
{
    //update field value
    self.field.value = [[CLLocation alloc] initWithLatitude:mapView.centerCoordinate.latitude
                                                  longitude:mapView.centerCoordinate.longitude];
}

- (void)mapView:(MKMapView *)mapView didUpdateUserLocation:(MKUserLocation *)userLocation {
    if (!_location) {
        MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(userLocation.coordinate, 800, 800);
        [mapView setRegion:[mapView regionThatFits:region] animated:YES];
        _location = userLocation.location;
        [_mapView removeAnnotations:_mapView.annotations];
        MKPlacemark *placemark = [[MKPlacemark alloc] initWithCoordinate:userLocation.coordinate addressDictionary:nil];
        [_mapView addAnnotation:placemark];
    }
}

- (MKAnnotationView *)mapView:(MKMapView *)mapView viewForAnnotation:(id <MKAnnotation>)annotation
{
    MKAnnotationView *view = [mapView dequeueReusableAnnotationViewWithIdentifier:@"annotation"];
    if (!view) {
        view = [[MKAnnotationView alloc] initWithAnnotation:annotation reuseIdentifier:@"annotation"];
        //view.canShowCallout = YES;
    }
    view.annotation = annotation;
    view.image = IMAGE(@"icon-location-building");
    return view;
}

- (BOOL)textFieldShouldBeginEditing:(UITextField *)textField {

    return YES;
}

- (void)textFieldDidBeginEditing:(UITextField *)textField
{
    [self onAddressBeginEditing:textField];
    [textField endEditing:YES];
}


@end
