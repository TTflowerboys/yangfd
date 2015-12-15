//
//  CUTEAddressBaseViewController.h
//  currant
//
//  Created by Foster Yin on 12/15/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "CUTEFormViewController.h"
#import "CUTERentAddressEditForm.h"

@interface CUTERentAddressBaseViewController : CUTEFormViewController

@property (nonatomic) BOOL updateLocationFromAddressFailed;

@property (nonatomic, copy) dispatch_block_t updateAddressCompletion;

@property (nonatomic, copy) dispatch_block_t notifyPostcodeChangedBlock;

- (CUTERentAddressEditForm *)form;

- (void)createTicket;

-  (void)clearTicketLocation;

- (BOOL)validateForm;

@end
