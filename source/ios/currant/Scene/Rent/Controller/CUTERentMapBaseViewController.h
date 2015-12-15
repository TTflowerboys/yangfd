//
//  CUTERentMapBaseViewController.h
//  currant
//
//  Created by Foster Yin on 12/15/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "FXForms.h"
#import "CUTETicket.h"
#import "CUTERentAddressMapForm.h"
#import <MKMapView+BBT.h>
#import <BFCancellationTokenSource.h>
#import "CUTEMapTextField.h"

#define kRegionDistance 800

@interface CUTERentMapBaseViewController : UIViewController <FXFormFieldViewController>

@property (nonatomic, readonly) MKMapView  *mapView;

@property (nonatomic, readonly) CUTEMapTextField *textField;

@property (nonatomic, readonly) UIImageView *annotationView;

@property (nonatomic, readonly) UIButton *userLocationButton;

@property (nonatomic, strong) FXFormField *field;

@property (strong, nonatomic) CUTERentAddressMapForm *form;

@property (nonatomic, retain) BFCancellationTokenSource *cancellationTokenSource;

- (void)startUpdateAllWithCurrentLocation;

- (void)startUpdateLocationWithAddress;

- (void)startUpdateAddressWithLocation:(CLLocation *)location;

@end
