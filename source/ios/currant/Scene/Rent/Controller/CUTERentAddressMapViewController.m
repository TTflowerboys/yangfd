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
#import "CUTERentAddressEditViewController.h"
#import "CUTERentPropertyInfoViewController.h"
#import "CUTEEnumManager.h"
#import "CUTEEnum.h"
#import <NSArray+ObjectiveSugar.h>
#import "CUTEDataManager.h"
#import <BBTRestClient.h>
#import "CUTEConfiguration.h"
#import "SVProgressHUD+CUTEAPI.h"
#import <AddressBook/AddressBook.h>
#import <INTULocationManager.h>
#import <Sequencer.h>
#import <UIAlertView+Blocks.h>
#import "CUTERentTickePublisher.h"
#import "CUTETracker.h"
#import "MasonryMake.h"


@interface CUTERentAddressMapViewController () <MKMapViewDelegate, UITextFieldDelegate>
{
    MKMapView *_mapView;

    CUTEMapTextField *_textField;

    CUTERentAddressEditViewController *_rentAddressEditViewController;

    UIButton *_userLocationButton;

    CLGeocoder *_geocoder;

}
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
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"继续") style:UIBarButtonItemStylePlain target:self action:@selector(onContinueButtonPressed:)];

    _geocoder = [[CLGeocoder alloc] init];

    _mapView = [[MKMapView alloc] init];
    _mapView.frame = self.view.bounds;
    _mapView.delegate = self;
    [self.view addSubview:_mapView];

    UIImageView *annotationView =  [[UIImageView alloc] init];
    annotationView.image = IMAGE(@"icon-location-building");
    [self.view addSubview:annotationView];

    CGSize imageSize = annotationView.image.size;
    MakeBegin(annotationView)
    MakeCenterXEqualTo(_mapView);
    MakeCenterYEqualTo(_mapView).offset(- imageSize.height / 2);
    MakeEnd

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

    [self startUpdateLocation];
}

-(void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:YES];

    //update address after edit user's address
    CUTEProperty *property = self.ticket.property;
    _textField.text = property.address;

    TrackScreen(GetScreenName(self));
}


- (BFTask *)requestLocation {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    //only need INTULocationAccuracyCity, if set other small accuracy will be very slow
    [[INTULocationManager sharedInstance] requestLocationWithDesiredAccuracy:INTULocationAccuracyCity timeout:30 delayUntilAuthorized:YES block:^(CLLocation *currentLocation, INTULocationAccuracy achievedAccuracy, INTULocationStatus status) {
        if (currentLocation) {
            [tcs setResult:currentLocation];
        }
        else {
            if (status == INTULocationStatusTimedOut) {
                [tcs setError:[NSError errorWithDomain:@"INTULocationManager" code:0 userInfo:@{NSLocalizedDescriptionKey: STR(@"获取当前位置超时")}]];
            }
            else if (status == INTULocationStatusError) {
                [tcs setError:[NSError errorWithDomain:@"INTULocationManager" code:0 userInfo:@{NSLocalizedDescriptionKey: STR(@"获取当前位置失败")}]];
            }
        }

    }];
    return tcs.task;
}

- (void)startUpdateLocation {

    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    if (status == kCLAuthorizationStatusDenied || status == kCLAuthorizationStatusRestricted) {
        [UIAlertView showWithTitle:STR(@"此应用程序对您的位置没有访问权，您可以在隐私设置中启用访问权或自行填写地址") message:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
        }];
    }
    else {
        [SVProgressHUD show];
        [[self requestLocation] continueWithBlock:^id(BFTask *task) {
            if (task.result) {
                CLLocation *location = task.result;
                MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(location.coordinate, 800, 800);
                [_mapView setRegion:[_mapView regionThatFits:region] animated:YES];
                [SVProgressHUD dismiss];
            }
            else {
                [SVProgressHUD showErrorWithError:task.error];
            }
            return nil;
        }];


    }
}

- (void)onAddressBeginEditing:(id)sender {

    if (!_rentAddressEditViewController) {
        if (!_rentAddressEditViewController) {
            CUTERentAddressEditViewController *controller = [[CUTERentAddressEditViewController alloc] init];
            controller.navigationItem.title = STR(@"位置");
            _rentAddressEditViewController = controller;
        }
    }

    NSArray *requiredEnums = @[@"country", @"city"];
    [[BFTask taskForCompletionOfAllTasksWithResults:[requiredEnums map:^id(id object) {
        return [[CUTEEnumManager sharedInstance] getEnumsByType:object];
    }]] continueWithBlock:^id(BFTask *task) {
        if (!IsArrayNilOrEmpty(task.result) && [task.result count] == [requiredEnums count]) {

            CUTEProperty *property = self.ticket.property;
            _rentAddressEditViewController.ticket = self.ticket;
            CUTERentAddressEditForm *form = [CUTERentAddressEditForm new];
            NSArray *countries = [task.result objectAtIndex:0];
            NSArray *cities = [task.result objectAtIndex:1];
            [form setAllCountries:countries];
            NSInteger countryIndex = [countries indexOfObject:property.country];
            if (countryIndex != NSNotFound) {
                [form setCountry:[countries objectAtIndex:countryIndex]];
                _rentAddressEditViewController.lastCountry = form.country;
            }
            [form setAllCities:cities];
            NSInteger cityIndex = [cities indexOfObject:property.city];
            if (cityIndex != NSNotFound) {
                [form setCity:[cities objectAtIndex:cityIndex]];
            }
            form.houseName = property.houseName;
            form.floor = property.floor;
            form.community = property.community;
            form.street = property.street;
            form.postcode = property.zipcode;
            _rentAddressEditViewController.formController.form = form;
            [_rentAddressEditViewController.tableView reloadData];

            [self.navigationController pushViewController:_rentAddressEditViewController animated:YES];
        }
        else {
            [SVProgressHUD showErrorWithError:task.error];
        }
        return nil;
    }];
}

- (void)onAddressLocationButtonTapped:(id)sender {
    TrackEvent(GetScreenName(self), kEventActionPress, @"look-up-address", nil);

    if (IsNilNullOrEmpty(_textField.text)) {
        [SVProgressHUD showErrorWithStatus:STR(@"地址不能为空，请编辑地址")];
        return;
    }

    [SVProgressHUD show];
    NSDictionary *locationDictionary = [NSDictionary dictionaryWithObjectsAndKeys:
                                        NilNullToEmpty(self.ticket.property.city.value), kABPersonAddressCityKey,
                                        NilNullToEmpty(self.ticket.property.country.value), kABPersonAddressCountryKey,
                                        [@[NilNullToEmpty(self.ticket.property.community), NilNullToEmpty(self.ticket.property.street)] componentsJoinedByString:@" "], kABPersonAddressStreetKey,
                                        NilNullToEmpty(self.ticket.property.zipcode), kABPersonAddressZIPKey,
                                        nil];
    [_geocoder geocodeAddressDictionary:locationDictionary completionHandler:^(NSArray *placemarks, NSError *error) {
        if (!IsArrayNilOrEmpty(placemarks)) {
            CLPlacemark *placemark = [placemarks firstObject];
            MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(placemark.location.coordinate, 800, 800);
            [_mapView setRegion:[_mapView regionThatFits:region] animated:YES];
            [SVProgressHUD dismiss];
        }
        else {
            [SVProgressHUD showErrorWithError:error];
        }
    }];
}

- (void)onUserLocationButtonPressed:(id)sender {
    [self startUpdateLocation];
}

- (BOOL)validateForm {
    CUTEProperty *property = [self.ticket property];

    if (!property.country) {
        if (!_rentAddressEditViewController) {
            [SVProgressHUD showErrorWithStatus:STR(@"请编辑地址")];
        }
        else {
            [SVProgressHUD showErrorWithStatus:STR(@"请填写国家")];
        }
        return NO;
    }
    if (!property.city) {
        if (!_rentAddressEditViewController) {
            [SVProgressHUD showErrorWithStatus:STR(@"请编辑地址")];
        }
        else {
            [SVProgressHUD showErrorWithStatus:STR(@"请填写城市")];
        }
        return NO;
    }
    if (!property.zipcode) {
        if (!_rentAddressEditViewController) {
            [SVProgressHUD showErrorWithStatus:STR(@"请编辑地址")];
        }
        else {
            [SVProgressHUD showErrorWithStatus:STR(@"请填写Postcode")];
        }
        return NO;
    }

    return YES;
}

- (void)onContinueButtonPressed:(id)sender {
    if (![self validateForm]) {
        return;
    }

    CUTETicket *currentTicket = self.ticket;
    if (currentTicket) {
        [SVProgressHUD show];
        Sequencer *sequencer = [Sequencer new];
        if (IsNilNullOrEmpty(currentTicket.identifier)) {
            [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
                [[[CUTERentTickePublisher sharedInstance] createTicket:currentTicket] continueWithBlock:^id(BFTask *task) {
                    if (task.error || task.exception || task.isCancelled) {
                        [SVProgressHUD showErrorWithError:task.error];
                    }
                    else {
                        currentTicket.identifier = task.result[@"ticket_id"];
                        currentTicket.property.identifier = task.result[@"property_id"];
                        [[CUTEDataManager sharedInstance] saveRentTicketToUnfinised:currentTicket];
                        completion(currentTicket);
                    }
                    return nil;
                }];
            }];
        }

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[[CUTEEnumManager sharedInstance] getEnumsByType:@"property_type"] continueWithBlock:^id(BFTask *task) {
                if (!IsArrayNilOrEmpty(task.result)) {
                    TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));
                    CUTERentPropertyInfoViewController *controller = [[CUTERentPropertyInfoViewController alloc] init];
                    controller.ticket = self.ticket;
                    CUTEPropertyInfoForm *form = [CUTEPropertyInfoForm new];
                    form.propertyType = currentTicket.property.propertyType;
                    form.bedroomCount = currentTicket.property.bedroomCount;
                    form.livingroomCount = currentTicket.property.livingroomCount;
                    form.bathroomCount = currentTicket.property.bathroomCount;
                    [form setAllPropertyTypes:task.result];
                    controller.formController.form = form;
                    [self.navigationController pushViewController:controller animated:YES];
                    [SVProgressHUD dismiss];
                }
                else {
                    [SVProgressHUD showErrorWithError:task.error];
                }

                return nil;
            }];
        }];

        [sequencer run];
    }
}

- (BFTask *)reverseGeocodeLocation:(CLLocation *)location {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    [_geocoder reverseGeocodeLocation:location completionHandler:^(NSArray *placemarks, NSError *error) {
        if (!IsArrayNilOrEmpty(placemarks)) {
            [tcs setResult:placemarks.firstObject];
        }
        else {
            [tcs setError:error];
        }
    }];
    return [tcs task];
}

- (BFTask *)updateAddress {

    CUTEProperty *property = self.ticket.property;
    BFTaskCompletionSource *tcs  = [BFTaskCompletionSource taskCompletionSource];

    Sequencer *sequencer = [Sequencer new];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[self reverseGeocodeLocation:property.location] continueWithBlock:^id(BFTask *task) {
            if (task.result) {
                completion(task.result);
            }
            else {
                TrackEvent(GetScreenName(self), kEventActionRequestReturn, @"non-geocoding-result", nil);
                [tcs setError:task.error];
            }
            return task;
        }];

    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        CLPlacemark *placemark = result;

        NSArray *requiredEnums = @[@"country", @"city"];
        [[BFTask taskForCompletionOfAllTasksWithResults:[requiredEnums map:^id(id object) {
            return [[CUTEEnumManager sharedInstance] getEnumsByType:object];
        }]] continueWithBlock:^id(BFTask *task) {

            if (!IsArrayNilOrEmpty(task.result) && [task.result count] == [requiredEnums count]) {
                NSArray *coutries = [(NSArray *)task.result[0] select:^BOOL(CUTEEnum *object) {
                    return [[object slug] isEqualToString:placemark.ISOcountryCode];
                }];

                NSArray *cities = [(NSArray *)task.result[1] select:^BOOL(CUTECityEnum *object) {
                    return [[object.country slug] isEqualToString:placemark.ISOcountryCode] && [[[placemark locality] lowercaseString] hasPrefix:[[object value] lowercaseString]];
                }];
                property.street = [@[NilNullToEmpty(placemark.subThoroughfare), NilNullToEmpty(placemark.thoroughfare)] componentsJoinedByString:@" "];
                property.zipcode = placemark.postalCode;
                property.country = IsArrayNilOrEmpty(coutries)? nil: [coutries firstObject];
                property.city = IsArrayNilOrEmpty(cities)? nil: [cities firstObject];
                property.street = placemark.thoroughfare;
                property.community = placemark.subThoroughfare;
                property.floor = nil;
                property.houseName = nil;

                _textField.text = property.address;

                [tcs setResult:_textField.text];
            }
            else {
                [tcs setError:task.error];
            }
            return task;
        }];
    }];

    [sequencer run];

    return tcs.task;
}

- (void)mapView:(MKMapView *)mapView regionDidChangeAnimated:(__unused BOOL)animated
{
    //update field value
    CLLocation *location = [[CLLocation alloc] initWithLatitude:mapView.centerCoordinate.latitude
                                                  longitude:mapView.centerCoordinate.longitude];
    CUTEProperty *property = self.ticket.property;
    property.location = location;
    [_textField.indicatorView startAnimating];
    [[self updateAddress] continueWithBlock:^id(BFTask *task) {
        [_textField.indicatorView stopAnimating];
        if (task.error || task.exception || task.isCancelled) {
            [SVProgressHUD showErrorWithError:task.error];
            return nil;
        } else {
            return nil;
        }
    }];


}

//- (MKAnnotationView *)mapView:(MKMapView *)mapView viewForAnnotation:(id <MKAnnotation>)annotation
//{
//    MKAnnotationView *view = [mapView dequeueReusableAnnotationViewWithIdentifier:@"annotation"];
//    if (!view) {
//        view = [[MKAnnotationView alloc] initWithAnnotation:annotation reuseIdentifier:@"annotation"];
//        //view.canShowCallout = YES;
//    }
//    view.annotation = annotation;
//    view.image = IMAGE(@"icon-location-building");
//    return view;
//}

- (BOOL)textFieldShouldBeginEditing:(UITextField *)textField {

    return YES;
}

- (void)textFieldDidBeginEditing:(UITextField *)textField
{
    [self onAddressBeginEditing:textField];
    [textField resignFirstResponder];
    [textField endEditing:YES];
}


@end
